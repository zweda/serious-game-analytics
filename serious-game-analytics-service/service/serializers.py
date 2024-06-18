from rest_framework import serializers
from service.models import Game, User, Event, UserEvent, UserEventProp, ResearchQuestion, EventGroup


class CSVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class UserEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEvent
        fields = '__all__'


class UserEventPropSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEventProp
        fields = '__all__'


class EventGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventGroup
        fields = '__all__'


class ResearchQuestionSerializer(serializers.ModelSerializer):
    event_groups = EventGroupSerializer(many=True, read_only=True)

    class Meta:
        model = ResearchQuestion
        fields = fields = ['id', 'name', 'description', 'uses_context', 'context_accessor', 'game',
                           'session_policy', 'aggregation_policy', 'aggregation_function', 'visualization_type',
                           'created_at', 'event_groups', 'measurement']


class ResearchQuestionWriteSerializer(serializers.ModelSerializer):
    event_groups = EventGroupSerializer(many=True, write_only=True)

    class Meta:
        model = ResearchQuestion
        fields = ['id', 'name', 'description', 'uses_context', 'context_accessor', 'session_policy', 'game',
                  'aggregation_policy', 'aggregation_function', 'visualization_type', 'created_at', 'event_groups',
                  'measurement']

    def create(self, validated_data):
        event_groups_data = validated_data.pop('event_groups')
        research_question = ResearchQuestion.objects.create(**validated_data)
        for event_group_data in event_groups_data:
            EventGroup.objects.create(research_question=research_question, **event_group_data)
        return research_question

    def update(self, instance, validated_data):
        event_groups_data = validated_data.pop('event_groups')
        instance = super().update(instance, validated_data)

        # Clear existing event groups
        instance.eventgroup_set.all().delete()

        # Create new event groups
        for event_group_data in event_groups_data:
            EventGroup.objects.create(research_question=instance, **event_group_data)

        return instance
