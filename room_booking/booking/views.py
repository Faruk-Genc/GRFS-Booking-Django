from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .models import Booking, Room, Floor
from .serializers import *
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Create your views here.

User = get_user_model()

class CreateBookingView(APIView):
    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomListView(APIView):
    permission_classes = [permissions.AllowAny] # Anyone can view rooms
    
    def get(self, request):
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
class BookingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Only admin
    
    def get(self, request):
        if request.user.role == 'admin':
            bookings = Booking.objects.all()
        else:
            bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = BookingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        serializer = FloorSerializer(bookings, many=True)
        return Response(serializer.data)
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    
class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)