"""Settings views — GET/PUT user settings."""

from ninja import Router

from api.auth import auth
from api.models import UserSettings
from api.schemas import UserSettingsResponse, UserSettingsUpdate

router = Router(tags=["settings"])


def _settings_to_response(s: UserSettings) -> UserSettingsResponse:
    return UserSettingsResponse(
        base_currency=s.base_currency,
        theme=s.theme,
    )


@router.get("/", response=UserSettingsResponse, auth=auth)
def get_settings(request):
    uid = request.user.id
    try:
        s = UserSettings.objects.get(user_id=uid)
    except UserSettings.DoesNotExist:
        s = UserSettings.objects.create(user_id=uid)
    return _settings_to_response(s)


@router.put("/", response=UserSettingsResponse, auth=auth)
def update_settings(request, body: UserSettingsUpdate):
    uid = request.user.id
    s, _ = UserSettings.objects.get_or_create(user_id=uid)
    s.base_currency = body.base_currency
    s.theme = body.theme
    s.save()
    return _settings_to_response(s)
