from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'height', 'weight', 'fitness_goal', 'initial_weight', 'date_of_birth')
        read_only_fields = ('id', 'email')
    
    def update(self, instance, validated_data):

        if 'height' in validated_data:
            instance.height = validated_data.get('height')
            print(f"Setting height to: {instance.height}")
            
        if 'weight' in validated_data:
            instance.weight = validated_data.get('weight')
            print(f"Setting weight to: {instance.weight}")
            
        if 'initial_weight' in validated_data:
            instance.initial_weight = validated_data.get('initial_weight')
            print(f"Setting weight to: {instance.initial_weight}")

        if 'fitness_goal' in validated_data:
            instance.fitness_goal = validated_data.get('fitness_goal')
            print(f"Setting fitness_goal to: {instance.fitness_goal}")
            
        if 'date_of_birth' in validated_data:
            instance.date_of_birth = validated_data.get('date_of_birth')
            
        instance.save()
        print(f"After instance.save() - height: {instance.height}, weight: {instance.weight}")
        
        return instance
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure numeric fields are properly formatted
        if data.get('height'):
            data['height'] = float(data['height'])
        if data.get('weight'):
            data['weight'] = float(data['weight'])
        if data.get('initial_weight'):
            data['initial_weight'] = float(data['initial_weight'])
        if data.get('fitness_goal'):
            data['fitness_goal'] = float(data['fitness_goal'])
        return data


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'height', 'weight', 'initial_weight', 'fitness_goal', 'date_of_birth')
        extra_kwargs = {'password': {'write_only': True}}
    

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

