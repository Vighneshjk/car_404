import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import CustomerProfile, StaffProfile

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['full_name'] = user.full_name
        token['email'] = user.email
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'phone': self.user.phone,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=15, min_length=10)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'phone', 'password', 'password_confirm']

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError("Phone number must be between 10 and 15 digits.")
        return value

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        

        password = data['password']
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one uppercase letter.'})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one lowercase letter.'})
        if not re.search(r'\d', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one digit.'})
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise serializers.ValidationError({'password': 'Password must contain at least one special character.'})
            
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone=validated_data.get('phone', ''),
            role=User.CUSTOMER,
        )
        CustomerProfile.objects.create(user=user)
        return user


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['loyalty_points', 'total_visits', 'notes', 'preferred_vehicle']
        read_only_fields = ['loyalty_points', 'total_visits']


class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ['employee_id', 'specialization', 'shift', 'is_available', 'joined_date', 'bio']


class UserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileSerializer(read_only=True)
    staff_profile = StaffProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'role',
            'avatar', 'date_joined', 'customer_profile', 'staff_profile'
        ]
        read_only_fields = ['id', 'date_joined', 'role']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'phone', 'avatar']
