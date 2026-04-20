# 📱 Planio Mobile App (Flutter)

Aplicación móvil **integrada en ProyectoPlanio** que se conecta al Gateway de microservicios.

## 🎯 Descripción

Versión móvil de Planio para iOS y Android, con las mismas características que la web:
- ✅ Autenticación (Email/Google)
- 📋 Tablero Kanban (TODO/DONE)
- 🎯 Seguimiento de hábitos
- 💬 Chat en tiempo real
- 🧑‍🤝‍🧑 Avatares personalizables
- 🪙 Sistema de monedas
- 🏠 Salas virtuales

## 🚀 Inicio Rápido

### Requisitos
- Flutter 3.11.5+
- Dart 3.11.5+
- Android Studio (Android) o Xcode (iOS)

### Instalación

```bash
# 1. Instalar dependencias
cd mobile
flutter pub get

# 2. Generar código (Freezed, Riverpod, etc.)
flutter pub run build_runner build

# 3. Ejecutar en Windows
flutter run -d windows

# 4. O en Android emulator
flutter run -d emulator-5554
```

## 🏗️ Arquitectura

**Conecta con el Gateway en puerto 8000:**
```
App Flutter (3001) → Gateway (8000) → Microservicios
                                    ├─ Activity Service (8001)
                                    ├─ Chat Service (8005)
                                    ├─ Personalization (8003)
                                    ├─ Analytics (8004)
                                    └─ Notifications (8002)
```

## 🔐 Autenticación

### Desarrollo (Actual)
- Autenticación **local simulada**
- No requiere Firebase ni conexión al gateway
- Ideal para testing de UI/UX

### Producción
Para usar con el Gateway que requiere Firebase:

1. **Instalar Firebase**
```bash
flutter pub add firebase_core firebase_auth
```

2. **Configurar en main.dart**
```dart
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const PlanioApp());
}
```

3. **Generar config**
```bash
flutterfire configure
```

4. **Descomentar en auth_service.dart** (búsqueda `// FIREBASE:`)

## 📁 Estructura
```bash
flutter run
```

#### En iOS:
```bash
flutter run -d macos
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura de **Clean Architecture + Feature-first**:

```
lib/
├── core/                    # Código compartido
│   ├── config/             # Configuración de la app
│   ├── constants/          # Constantes globales
│   ├── services/           # Servicios (API, Storage, WebSocket)
│   ├── models/             # Modelos base
│   └── utils/              # Utilidades y extensiones
├── features/               # Características principales
│   ├── auth/               # Autenticación
│   ├── activity/           # Gestión de actividades y tareas
│   ├── personalization/    # Avatares y personalización
│   ├── chat/               # Chat y mensajería
│   └── common/             # Widgets y temas comunes
├── providers/              # Proveedores de Riverpod (estado global)
└── main.dart              # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

Edita `lib/core/config/environment.dart` para configurar:
- URL del API Gateway
- URL del WebSocket
- Credenciales de Google OAuth

```dart
static const String apiGatewayUrl = 'http://192.168.1.100:3000'; // Usa tu IP local para testing
static const String websocketUrl = 'ws://192.168.1.100:3001';
```

### Conexión con Backend Local

Para conectar la app móvil con el backend local en Docker:

1. **Obtén tu IP local:**
```bash
ipconfig
```

2. **Actualiza los endpoints** en `environment.dart` con tu IP (ej: 192.168.1.100)

3. **Asegúrate de que el docker-compose esté corriendo:**
```bash
docker-compose up
```

## 📦 Dependencias principales

- **flutter_riverpod**: Gestión de estado
- **dio**: Cliente HTTP
- **go_router**: Navegación
- **web_socket_channel**: WebSocket para tiempo real
- **google_sign_in**: Autenticación con Google
- **shared_preferences**: Almacenamiento local
- **intl**: Internacionalización

## 🛠️ Desarrollo

### Ejecutar tests
```bash
flutter test
```

### Analizar código
```bash
flutter analyze
```

### Formatear código
```bash
dart format .
```

### Generar builds
```bash
# Android APK
flutter build apk

# Android App Bundle
flutter build appbundle

# iOS
flutter build ios

# Windows
flutter build windows
```

## 📝 Próximos pasos

1. [ ] Implementar pantalla de Login
2. [ ] Implementar autenticación con Google OAuth
3. [ ] Crear modelo de datos para Room/Task/Habit
4. [ ] Implementar listado de salas
5. [ ] Implementar tablero Kanban
6. [ ] Implementar seguimiento de hábitos
7. [ ] Implementar chat en tiempo real
8. [ ] Implementar personalización y tienda
9. [ ] Conectar con WebSocket para notificaciones
10. [ ] Temas oscuros/claros

## 📚 Documentación

- [Flutter Docs](https://flutter.dev/docs)
- [Riverpod Docs](https://riverpod.dev)
- [Dio Docs](https://github.com/flutterchina/dio)
- [GoRouter Docs](https://pub.dev/packages/go_router)

## 🤝 Contribución

Este proyecto es parte del proyecto de Software Architecture 2026-I de la Universidad Nacional de Colombia.

## 📄 Licencia

Ver archivo `LICENSE` en el directorio raíz del proyecto.

## 👥 Equipo

- Jeronimo Bermudez Hernandez  
- Juan Sebastian Cabezas Mateus  
- Jenny Catherine Herrera Garzon  
- Sharick Yelixa Torres Monroy  
- Laura Sofia Vargas Rodriguez  

---

**Última actualización:** Abril 2026
