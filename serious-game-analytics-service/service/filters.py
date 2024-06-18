import django_filters
from service.models import User, Game, Event, UserEvent, UserEventProp, ResearchQuestion, EventGroup


class GameFilter(django_filters.FilterSet):
    class Meta:
        model = Game
        fields = {
            'code': ['exact', 'icontains'],
            'name': ['exact', 'icontains'],
            'created_at': ['exact', 'gte', 'lte'],
        }


class UserFilter(django_filters.FilterSet):
    class Meta:
        model = User
        fields = {
            'email': ['exact', 'icontains'],
            'age': ['exact', 'gte', 'lte'],
            'gender': ['exact'],
            'country': ['exact', 'icontains'],
            'game': ['exact'],
        }


class EventFilter(django_filters.FilterSet):
    class Meta:
        model = Event
        fields = {
            'name': ['exact', 'icontains'],
            'description': ['exact', 'icontains'],
            'created_at': ['exact', 'gte', 'lte'],
            'game': ['exact'],
        }


class UserEventsFilter(django_filters.FilterSet):
    class Meta:
        model = UserEvent
        fields = {
            'timestamp': ['exact', 'gte', 'lte'],
            'session_id': ['exact'],
            'user': ['exact'],
            'event': ['exact'],
        }


class UserEventPropsFilter(django_filters.FilterSet):
    class Meta:
        model = UserEventProp
        fields = {
            'key': ['exact', 'icontains'],
            'type': ['exact', 'icontains'],
            'value': ['exact', 'icontains'],
            'user_event': ['exact'],
        }


class ResearchQuestionFilter(django_filters.FilterSet):
    class Meta:
        model = ResearchQuestion
        fields = {
            'name': ['exact', 'icontains'],
            'created_at': ['exact', 'gte', 'lte'],
            'game': ['exact']
        }


class EventGroupFilter(django_filters.FilterSet):
    class Meta:
        model = EventGroup
        fields = {
            'event': ['exact'],
            'research_question': ['exact']
        }
