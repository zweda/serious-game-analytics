import uuid
from django.db import models
from django.db.models import EmailField


class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=100, unique=True, null=True, blank=True)
    name = models.CharField(max_length=250, null=False, blank=False)
    description = models.TextField(null=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    aptabase_app_id = models.CharField(max_length=100, null=True, blank=True)
    aptabase_app_name = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"({self.id}) {self.name} ({self.code}) [{self.description}]"


class User(models.Model):
    id = models.CharField(max_length=16, primary_key=True)
    email = EmailField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=1, null=True, blank=True)
    os = models.CharField(max_length=100, null=True, blank=True)
    os_version = models.CharField(max_length=100, null=True, blank=True)
    locale = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    country_code = models.CharField(max_length=20, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    first_session_id = models.BigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.email} {self.age} {self.gender}"


class ResearchQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=250, null=False, blank=False)
    description = models.TextField(null=False, blank=True)
    # gameplay, learning, engagement, immersion
    measurement = models.CharField(max_length=250, null=False, blank=False, default="gameplay")
    uses_context = models.BooleanField(null=False, default=False)
    # used for doing calculations only between occurrences of the event
    time_between = models.BooleanField(null=False, default=False)
    label_for_time = models.CharField(max_length=250, null=True, blank=True, default="")
    context_accessor = models.CharField(max_length=250, null=True, blank=True)
    # only-first, average, each
    session_policy = models.CharField(max_length=250, null=True, blank=True, default="")
    # per-user, globally
    aggregation_policy = models.CharField(max_length=50, null=True, blank=True, default="")
    # sum, count
    aggregation_function = models.CharField(max_length=50, null=True, blank=True, default="")
    # scalar, scatter, bar, line, pie
    visualization_type = models.CharField(max_length=50, null=True, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.name} [{self.description}]"


class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    name = models.CharField(max_length=250, null=False, blank=False)
    description = models.TextField(null=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    game = models.ForeignKey(Game, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.name} [{self.description}]"


class EventGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    label = models.CharField(max_length=250, null=True, blank=False)
    accessor = models.CharField(max_length=250, null=True, blank=True, default="")
    # value, sum, range, time
    value_policy = models.CharField(max_length=250, null=True, blank=True, default="")
    start_value = models.CharField(max_length=250, null=True, blank=True, default="")
    end_value = models.CharField(max_length=250, null=True, blank=True, default="")

    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    research_question = models.ForeignKey(ResearchQuestion, related_name='event_groups', null=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)


class UserEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    timestamp = models.DateTimeField(null=False, blank=False)
    session_id = models.BigIntegerField(null=False, blank=False)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"({self.id}) USER: {self.user} EVENT: {self.event}"


class UserEventProp(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    key = models.CharField(max_length=250, null=False, blank=False)
    type = models.CharField(max_length=250, null=False)
    value = models.CharField(max_length=250, null=False, blank=False)

    user_event = models.ForeignKey(UserEvent, on_delete=models.CASCADE)

    def __str__(self):
        return f"({self.id}) {self.type} {self.key}:  {self.value}"
