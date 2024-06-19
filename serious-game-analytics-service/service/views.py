import csv
from collections import namedtuple
from csv import DictReader

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, F
from django.http import JsonResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.utils import json
from rest_framework.views import APIView

from service.filters import UserFilter, GameFilter, EventFilter, ResearchQuestionFilter, UserEventPropsFilter, \
    EventGroupFilter
from service.models import Game, User, Event, UserEvent, UserEventProp, ResearchQuestion, EventGroup
from service.serializers import (GameSerializer, UserSerializer, EventSerializer, UserEventSerializer,
                                 UserEventPropSerializer, ResearchQuestionSerializer, CSVUploadSerializer,
                                 EventGroupSerializer, ResearchQuestionWriteSerializer)


class CSVUploadAndProcessView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        game_code = kwargs['game_code']
        game = Game.objects.get(code=game_code)

        serializer = CSVUploadSerializer(data=request.data)
        if serializer.is_valid():
            csv_file = request.FILES['file']
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            reader: DictReader[any] = csv.DictReader(decoded_file)

            # Process the CSV data
            for row in reader:
                # Save users recorded for a game
                user_id = row['user_id']
                try:
                    user = User.objects.get(id=user_id, game=game)
                except User.DoesNotExist:
                    user = User.objects.create(
                        id=user_id,
                        os=row['os_name'],
                        os_version=row['os_version'],
                        locale=row['locale'],
                        country=row['country_name'],
                        country_code=row['country_code'],
                        region=row['region_name'],
                        game=game,
                    )

                try:
                    event = Event.objects.get(name=row['event_name'], game=game)
                except Event.DoesNotExist:
                    event = Event.objects.create(
                        name=row['event_name'],
                        game=game
                    )

                timestamp = row['timestamp']
                session_id = row['session_id']

                if user.first_session_id is None:
                    user.first_session_id = session_id
                    user.save()

                try:
                    user_event = UserEvent.objects.get(timestamp=timestamp,
                                                       session_id=session_id,
                                                       game=game, user=user,
                                                       event=event)
                except UserEvent.DoesNotExist:
                    user_event = UserEvent.objects.create(
                        timestamp=timestamp,
                        session_id=session_id,
                        game=game, user=user,
                        event=event
                    )

                string_props = json.loads(row['string_props'])
                numeric_props = json.loads(row['numeric_props'])

                if event.name == "user-data" and user.email is None and user.gender is None and user.age is None:
                    user.email = string_props['email']
                    user.gender = string_props['gender']
                    user.age = numeric_props['age']
                    user.save()

                try:
                    UserEventProp.objects.get(user_event=user_event)
                except UserEventProp.DoesNotExist:
                    for key, value in string_props.items():
                        UserEventProp.objects.create(
                            user_event=user_event,
                            key=key,
                            value=str(value),
                            type="string"
                        )

                    for key, value in numeric_props.items():
                        UserEventProp.objects.create(
                            user_event=user_event,
                            key=key,
                            value=str(value),
                            type="numeric"
                        )
                except UserEventProp.MultipleObjectsReturned:
                    pass

            return JsonResponse({'message': 'CSV file processed successfully'}, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnalyticsView(APIView):
    def get(self, request, *args, **kwargs):
        game_code = kwargs['game_code']
        measurement = kwargs['measurement']
        game = Game.objects.get(code=game_code)

        rqs = ResearchQuestion.objects.filter(game=game, measurement=measurement)
        result = []
        for rq in rqs:
            result_dic = {
                "question": rq.name,
                "description": rq.description,
                "visualization": rq.visualization_type
            }

            axes = EventGroup.objects.filter(research_question=rq)

            # labels
            labels = []
            if rq.time_between:
                labels.append(rq.label_for_time)
            else:
                for axis in axes:
                    labels.append(axis.label)
            result_dic["labels"] = labels

            # context values for drop down and keyed data
            if rq.uses_context:
                context_key = rq.context_accessor
                context_values = []
                context_event = Event.objects.get(name="context-changed")
                ctxs = UserEvent.objects.filter(event=context_event)
                for ctx in ctxs:
                    ctxs_props = UserEventProp.objects.filter(user_event=ctx, key=context_key)
                    for prop in ctxs_props:
                        if prop.value not in context_values:
                            context_values.append(prop.value)

                result_dic["context_values"] = context_values

            if rq.aggregation_policy == "user":
                users = User.objects.filter(game=game)
                users_data = []
                for user in users:
                    if rq.session_policy == "first":
                        user_data = []
                        user_events = UserEvent.objects.filter(session_id=user.first_session_id, user=user)

                        if rq.time_between:
                            pass

                        for axis in axes:
                            if axis.value_policy == "value":
                                try:
                                    # if there's more than one then we use first
                                    one_user_event = user_events.filter(event=axis.event).first()
                                    user_event_props = UserEventProp.objects.get(user_event=one_user_event,
                                                                                 key=axis.accessor)
                                except (UserEvent.DoesNotExist, UserEventProp.DoesNotExist):
                                    # if we have neither event not value to draw from we stop
                                    break

                                value = user_event_props.value
                                # we want to enforce int values for scatter and line
                                if rq.visualization_type == "scatter" or rq.visualization_type == "line":
                                    try:
                                        value = int(value)
                                    except ValueError:
                                        break

                                user_data.append(value)
                            elif axis.value_policy == "count":
                                user_data.append(user_events.filter(event=axis.event).count())

                        users_data.append(user_data)
                    elif rq.session_policy == "each":
                        sessions = UserEvent.objects.get(user=user).values_list("session_id", flat=True)
                        for session_id in sessions:
                            session_data = []
                            user_events = UserEvent.objects.filter(session_id=session_id, user=user)
                            for axis in axes:
                                if axis.value_policy == "value":
                                    try:
                                        # if there's more than one then we use first
                                        one_user_event = user_events.filter(event=axis.event).first()
                                        user_event_props = UserEventProp.objects.get(user_event=one_user_event,
                                                                                     key=axis.accessor)
                                    except (UserEvent.DoesNotExist, UserEventProp.DoesNotExist):
                                        # if we have neither event not value to draw from we stop
                                        break

                                    value = user_event_props.value
                                    # we want to enforce int values for scatter and line
                                    if rq.visualization_type == "scatter" or rq.visualization_type == "line":
                                        try:
                                            value = int(value)
                                        except ValueError:
                                            break

                                    session_data.append(value)
                                elif axis.value_policy == "count":
                                    session_data.append(user_events.filter(event=axis.event).count())

                            users_data.append(session_data)
                result_dic["data"] = users_data

            result.append(result_dic)
        return JsonResponse({"results": result}, status=status.HTTP_200_OK)


class UserStatisticsView(APIView):
    GenderCount = namedtuple('GenderCount', ['gender', 'count'])
    AgeCount = namedtuple('AgeCount', ['age', 'count'])
    RegionCount = namedtuple('RegionCount', ['region', 'count'])

    def get(self, request, *args, **kwargs):
        game_code = kwargs['game_code']
        game = Game.objects.get(code=game_code)

        # Group by gender
        gender_counts = User.objects.filter(game=game, gender__isnull=False).values('gender').annotate(
            count=Count('gender'))
        gender_results = [self.GenderCount(gender=item['gender'], count=item['count']) for item in gender_counts]

        # Group by age
        age_counts = User.objects.filter(game=game, age__isnull=False).values('age').annotate(count=Count('age'))
        age_results = [self.AgeCount(age=item['age'], count=item['count']) for item in age_counts]

        # Group by region
        region_counts = User.objects.filter(game=game, region__isnull=False).values('region').annotate(
            count=Count('region'))
        region_results = [self.RegionCount(region=item['region'], count=item['count']) for item in region_counts]

        # Prepare response data
        response_data = {
            'gender_data': [gender._asdict() for gender in gender_results],
            'age_data': [age._asdict() for age in age_results],
            "region_data": [region._asdict() for region in region_results]
        }

        return JsonResponse(response_data)


class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = GameFilter

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance_id = instance.id
        if Event.objects.filter(game=instance).exists():
            return JsonResponse({'error': 'Cannot delete game because of existing events tied to it.'},
                                status=status.HTTP_400_BAD_REQUEST)
        self.perform_destroy(instance)
        return JsonResponse({'id': instance_id}, status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserFilter


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventFilter

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        # Get the count of UserEventTable entries for each event
        event_counts = UserEvent.objects.values('event').annotate(count=Count('id'))
        event_count_dict = {str(item['event']): item['count'] for item in event_counts}

        # get possible event keys
        event_prop_keys = UserEventProp.objects.values('user_event__event', 'key')
        event_prop_keys_dict = {}
        for item in event_prop_keys:
            event_id = str(item['user_event__event'])
            if event_id in event_prop_keys_dict:
                if item['key'] not in event_prop_keys_dict[event_id]:
                    event_prop_keys_dict[event_id].append(item['key'])
            else:
                event_prop_keys_dict[event_id] = [item['key']]

        # Get all possible enum values for action event
        action_event_props = (UserEventProp.objects.values('user_event__event', 'value')
                              .filter(user_event__event__name__startswith="action"))

        event_prop_dict = {}
        for item in action_event_props:
            event_id = str(item['user_event__event'])
            if event_id in event_prop_dict:
                if item['value'] not in event_prop_dict[event_id]:
                    event_prop_dict[event_id].append(item['value'])
            else:
                event_prop_dict[event_id] = [item['value']]

        response_data = serializer.data
        for event in response_data:
            event_id = event['id']
            event['count'] = event_count_dict.get(event_id, 0)
            event['enum'] = event_prop_dict.get(event_id, [])
            event['fields'] = event_prop_keys_dict.get(event_id, [])
            event['reserved'] = event['name'] in ['context-changed', 'user-data']

        return JsonResponse({
            "results": response_data
        })


class ResearchQuestionViewSet(viewsets.ModelViewSet):
    queryset = ResearchQuestion.objects.all()
    serializer_class = ResearchQuestionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ResearchQuestionFilter

    queryset = ResearchQuestion.objects.all()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ResearchQuestionWriteSerializer
        return ResearchQuestionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return JsonResponse(serializer.data)


class UserEventViewSet(viewsets.ModelViewSet):
    queryset = UserEvent.objects.all()
    serializer_class = UserEventSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserEvent


class UserEventPropViewSet(viewsets.ModelViewSet):
    queryset = UserEventProp.objects.all()
    serializer_class = UserEventPropSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = UserEventPropsFilter


class EventGroupViewSet(viewsets.ModelViewSet):
    queryset = EventGroup.objects.all()
    serializer_class = EventGroupSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EventGroupFilter
