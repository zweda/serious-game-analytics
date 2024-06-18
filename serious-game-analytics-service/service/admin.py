from django.contrib import admin
from service.models import Game, User, Event, UserEvent, UserEventProp, ResearchQuestion


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')
    list_filter = ('created_at',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'age', 'gender', 'created_at')
    search_fields = ('email', 'id')
    list_filter = ('created_at', 'gender', 'country')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at', 'game')


@admin.register(UserEvent)
class UserEventsAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'session_id', 'user', 'event')
    search_fields = ('session_id',)
    list_filter = ('timestamp', 'user', 'event')


@admin.register(UserEventProp)
class UserEventPropsAdmin(admin.ModelAdmin):
    list_display = ('key', 'type', 'value', 'user_event')
    search_fields = ('key', 'value')
    list_filter = ('type', 'user_event')


@admin.register(ResearchQuestion)
class ResearchQuestionAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'game')
    list_filter = ('created_at', 'description')
