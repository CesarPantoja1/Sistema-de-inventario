# Sistema de Inventario + Ventas + BI

Sistema empresarial completo de gestión de inventario con módulos de ventas y Business Intelligence. Desarrollado con arquitectura moderna, clean code y mejores prácticas de desarrollo.

## Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Deploy](#deploy)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Características

### Módulos Principales

- **Autenticación y Usuarios**: Sistema de login con JWT, roles (admin, vendedor, bodeguero)
- **Gestión de Productos**: CRUD completo con categorías, SKU, control de stock
- **Proveedores**: Gestión de información de proveedores
- **Movimientos de Inventario**: Entradas, salidas, ajustes con auditoría completa
- **Ventas**: Sistema completo de ventas con descuento automático de stock
- **Dashboard BI**: Métricas, gráficos y KPIs en tiempo real
- **Reportes**: Generación de reportes exportables (PDF/CSV)
- **Auditoría**: Log completo de acciones críticas

### Características Técnicas

- Clean Architecture con separación de responsabilidades
- Patrón Repository para abstracción de datos
- Service Layer para lógica de negocio
- API REST documentada (Swagger/OpenAPI)
- Validaciones robustas (backend y frontend)
- Manejo de errores centralizado
- Autenticación JWT con refresh tokens
- Migraciones de base de datos con Alembic
- Containerización completa con Docker
- CI/CD con GitHub Actions
- Tests unitarios e integración

## Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.109+
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL 16
- **Validación**: Pydantic v2
- **Auth**: python-jose (JWT), passlib (bcrypt)
- **Testing**: pytest, httpx
- **Linting**: ruff, black

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Testing**: Vitest, React Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deploy Backend**: Railway / Render
- **Deploy Frontend**: Vercel

## Arquitectura

El proyecto sigue **Clean Architecture** con las siguientes capas:

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/          # Controllers (endpoints)
│   ├── core/         # Config, security, database
│   ├── domain/       # Business entities
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic DTOs
│   ├── repositories/ # Data access layer
│   ├── services/     # Business logic
│   └── utils/        # Utilities
```

### Frontend (React)
```
frontend/
├── src/
│   ├── app/          # App config, router
│   ├── features/     # Feature modules
│   │   ├── auth/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── sales/
│   │   └── analytics/
│   └── shared/       # Shared components, hooks, utils
```

Para más detalles, ver [ARCHITECTURE.md](./ARCHITECTURE.md)

## Instalación

### Prerrequisitos

- Docker y Docker Compose
- Git

### Clonar el repositorio

```bash
git clone https://github.com/CesarPantoja1/Sistema-de-inventario.git
cd Sistema-de-inventario
```

### Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (opcional para desarrollo)
# Los valores por defecto funcionan para desarrollo local
```

### Levantar los servicios con Docker

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

Los servicios estarán disponibles en:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/api/v1/docs
- **PostgreSQL**: localhost:5432

## Uso

### Acceso a la aplicación

1. Abre el navegador en http://localhost:5173
2. El backend estará corriendo en http://localhost:8000
3. La documentación interactiva de la API está en http://localhost:8000/api/v1/docs

### API Endpoints

Ver documentación completa en `/api/v1/docs` una vez levantado el backend.

Endpoints principales:
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/products` - Listar productos
- `POST /api/v1/sales` - Crear venta
- `GET /api/v1/analytics/dashboard` - Métricas BI

## Desarrollo

### Desarrollo local sin Docker

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar .env
cp .env.example .env

# Ejecutar servidor de desarrollo
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar .env
cp .env.example .env

# Ejecutar servidor de desarrollo
npm run dev
```

### Migraciones de Base de Datos

```bash
cd backend

# Crear nueva migración
alembic revision --autogenerate -m "descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir última migración
alembic downgrade -1
```

## Testing

### Backend Tests

```bash
cd backend

# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=app --cov-report=html

# Solo tests unitarios
pytest tests/unit

# Solo tests de integración
pytest tests/integration
```

### Frontend Tests

```bash
cd frontend

# Ejecutar tests
npm run test

# Con UI
npm run test:ui

# Con cobertura
npm run test:coverage
```

## Deploy

### Backend (Railway)

1. Crear nuevo proyecto en Railway
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Deploy automático en cada push a `main`

### Frontend (Vercel)

1. Importar proyecto en Vercel
2. Configurar `VITE_API_BASE_URL` con URL del backend
3. Deploy automático en cada push a `main`

Ver instrucciones detalladas en [docs/DEPLOY.md](./docs/DEPLOY.md) (próximamente)

## Roadmap

### Sprint 0: Setup e Infraestructura ✅
- [x] Estructura de proyecto
- [x] Docker Compose
- [x] Configuración base backend
- [x] Configuración base frontend

### Sprint 1: Autenticación (En desarrollo)
- [ ] Modelo User
- [ ] Endpoints login/register
- [ ] JWT implementation
- [ ] Frontend login/register pages
- [ ] Protected routes

### Sprint 2: Productos y Categorías
- [ ] CRUD productos
- [ ] CRUD categorías
- [ ] Frontend completo

### Sprint 3: Proveedores
- [ ] CRUD proveedores
- [ ] Integración con productos

### Sprint 4: Inventario
- [ ] Movimientos de stock
- [ ] Alertas de stock bajo
- [ ] Historial de movimientos

### Sprint 5: Ventas
- [ ] Sistema de ventas
- [ ] Descuento automático de stock
- [ ] Facturación

### Sprint 6: Dashboard BI
- [ ] Métricas y KPIs
- [ ] Gráficos interactivos
- [ ] Reportes visuales

### Sprint 7: Reportes y Auditoría
- [ ] Generación de reportes
- [ ] Sistema de auditoría
- [ ] Logs de acciones

### Sprint 8: Deploy y CI/CD
- [ ] GitHub Actions
- [ ] Deploy automatizado
- [ ] Monitoreo

## Estructura del Proyecto

```
.
├── backend/              # FastAPI backend
│   ├── app/             # Código de la aplicación
│   ├── tests/           # Tests
│   ├── alembic/         # Migraciones DB
│   └── Dockerfile
├── frontend/            # React frontend
│   ├── src/            # Código de la aplicación
│   ├── tests/          # Tests
│   └── Dockerfile
├── docs/               # Documentación adicional
├── docker-compose.yml  # Orquestación de servicios
├── ARCHITECTURE.md     # Documentación de arquitectura
└── README.md          # Este archivo
```

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Solo documentación
- `style:` Formato de código
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Mantenimiento

## Licencia

Este proyecto es de código abierto bajo la licencia MIT.

## Autor

**César Pantoja** - Full-Stack Developer | DevOps & Automation

- LinkedIn: [César Pantoja](https://www.linkedin.com/in/pantoja-c%C3%A9sar-82799b275/)
- Email: cesarpantoja475@gmail.com
- GitHub: [@CesarPantoja1](https://github.com/CesarPantoja1)

---

Hecho con dedicación como parte de mi portafolio profesional.
