from rest_framework import serializers

from activities.domain.enums import EntityType, EventType, OrderStatus


class ActivityEventSerializer(serializers.Serializer):
    eventType = serializers.ChoiceField(
        choices=[event_type.value for event_type in EventType]
    )
    entityType = serializers.ChoiceField(
        choices=[entity_type.value for entity_type in EntityType]
    )
    entityId = serializers.CharField()
    restaurantId = serializers.IntegerField()
    orderId = serializers.CharField(required=False, allow_blank=False)
    timestamp = serializers.DateTimeField()
    sourceService = serializers.CharField()
    payload = serializers.DictField()

    def validate(self, attrs):
        entity_type = attrs.get("entityType")
        order_id = attrs.get("orderId")
        payload = attrs.get("payload", {})

        if entity_type == EntityType.ORDER.value and not order_id:
            raise serializers.ValidationError(
                {
                    "orderId": "orderId is required when entityType is ORDER"
                }
            )

        if entity_type == EntityType.ORDER.value and "status" in payload:
            allowed_statuses = [status.value for status in OrderStatus]
            if payload["status"] not in allowed_statuses:
                raise serializers.ValidationError(
                    {
                        "payload": {
                            "status": (
                                "Invalid order status. Allowed values are: "
                                + ", ".join(allowed_statuses)
                            )
                        }
                    }
                )

        return attrs