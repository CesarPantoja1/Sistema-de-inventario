# Arquitectura del Sistema de Inventario + Ventas + BI

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura de Software](#arquitectura-de-software)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Estructura de Base de Datos](#estructura-de-base-de-datos)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Estrategia de Branches y Commits](#estrategia-de-branches-y-commits)
7. [Plan de Sprints](#plan-de-sprints)

---

## 🎯 Visión General

### Objetivo
Sistema empresarial de gestión de inventario con módulos de ventas y Business Intelligence, diseñado con arquitectura escalable, mantenible y siguiendo principios SOLID.

### Principios Fundamentales
- **Clean Architecture**: Separación clara de responsabilidades
- **SOLID Principles**: Código mantenible y extensible
- **Domain-Driven Design (DDD)**: Modelo centrado en el dominio del negocio
- **API-First**: Backend como servicio independiente
- **Containerization**: Todo dockerizado desde el inicio

---

## 🏗 Arquitectura de Software

### Backend: Clean Architecture con FastAPI

```
backend/
├── app/
│   ├── core/                      # Configuración central
│   │   ├── config.py              # Settings (Pydantic BaseSettings)
│   │   ├── security.py            # JWT, hashing, auth utilities
│   │   ├── dependencies.py        # Dependency injection
│   │   └── database.py            # DB session, engine
│   │
│   ├── domain/                    # Capa de Dominio (Entities + Business Rules)
│   │   ├── entities/              # Modelos de dominio puros
│   │   └── value_objects/         # Value objects (ej: Money, SKU)
│   │
│   ├── models/                    # Capa de Persistencia (SQLAlchemy ORM)
│   │   ├── __init__.py
│   │   ├── base.py                # Base class con campos comunes
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── supplier.py
│   │   ├── inventory_movement.py
│   │   ├── sale.py
│   │   └── audit_log.py
│   │
│   ├── schemas/                   # Capa de Aplicación (DTOs - Pydantic)
│   │   ├── __init__.py
│   │   ├── user.py                # UserCreate, UserResponse, UserUpdate
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── supplier.py
│   │   ├── inventory.py
│   │   ├── sale.py
│   │   └── common.py              # Schemas compartidos (Pagination, etc)
│   │
│   ├── repositories/              # Patrón Repository (abstracción de datos)
│   │   ├── __init__.py
│   │   ├── base.py                # Generic CRUD repository
│   │   ├── user_repository.py
│   │   ├── product_repository.py
│   │   ├── inventory_repository.py
│   │   └── sale_repository.py
│   │
│   ├── services/                  # Capa de Lógica de Negocio (Use Cases)
│   │   ├── __init__.py
│   │   ├── auth_service.py        # Login, register, token refresh
│   │   ├── product_service.py     # Business logic para productos
│   │   ├── inventory_service.py   # Lógica de movimientos, alertas
│   │   ├── sale_service.py        # Procesamiento de ventas
│   │   ├── analytics_service.py   # Cálculos BI, métricas
│   │   └── audit_service.py       # Registro de auditoría
│   │
│   ├── api/                       # Capa de Presentación (Controllers)
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py            # POST /login, /register
│   │   │   ├── users.py           # CRUD usuarios
│   │   │   ├── products.py        # CRUD productos
│   │   │   ├── categories.py
│   │   │   ├── suppliers.py
│   │   │   ├── inventory.py       # Movimientos de inventario
│   │   │   ├── sales.py           # Registro de ventas
│   │   │   ├── analytics.py       # Endpoints de BI
│   │   │   └── reports.py         # Generación de reportes
│   │   └── deps.py                # Dependencies comunes (get_current_user)
│   │
│   ├── utils/                     # Utilidades auxiliares
│   │   ├── __init__.py
│   │   ├── exceptions.py          # Custom exceptions
│   │   ├── validators.py          # Validaciones personalizadas
│   │   └── helpers.py             # Funciones helper
│   │
│   └── main.py                    # Entry point de la aplicación
│
├── tests/
│   ├── unit/                      # Tests unitarios (services, utils)
│   ├── integration/               # Tests de integración (API)
│   └── conftest.py                # Fixtures de pytest
│
├── alembic/                       # Migraciones de base de datos
│   ├── versions/
│   └── env.py
│
├── scripts/
│   ├── seed_data.py               # Script para datos de prueba
│   └── init_db.py                 # Inicialización de DB
│
├── .env.example
├── Dockerfile
├── requirements.txt
├── pytest.ini
└── alembic.ini
```

### Frontend: Arquitectura por Features

```
frontend/
├── src/
│   ├── app/                       # Configuración global de la app
│   │   ├── App.tsx
│   │   ├── router.tsx             # React Router configuration
│   │   └── store.ts               # Estado global (Context API o Zustand)
│   │
│   ├── features/                  # Módulos por dominio (Feature-Sliced Design)
│   │   ├── auth/
│   │   │   ├── components/        # Login, Register forms
│   │   │   ├── hooks/             # useAuth, useLogin
│   │   │   ├── services/          # authService.ts (API calls)
│   │   │   ├── types/             # Auth types
│   │   │   └── pages/             # LoginPage, RegisterPage
│   │   │
│   │   ├── products/
│   │   │   ├── components/        # ProductCard, ProductForm, ProductTable
│   │   │   ├── hooks/             # useProducts, useProductForm
│   │   │   ├── services/          # productService.ts
│   │   │   ├── types/             # Product interfaces
│   │   │   └── pages/             # ProductsListPage, ProductDetailPage
│   │   │
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── analytics/             # Dashboard, Charts
│   │   └── reports/
│   │
│   ├── shared/                    # Código compartido entre features
│   │   ├── components/            # Button, Modal, Table, etc
│   │   │   ├── ui/                # Componentes base (shadcn-style)
│   │   │   └── layout/            # Navbar, Sidebar, Layout
│   │   ├── hooks/                 # useDebounce, usePagination, etc
│   │   ├── services/
│   │   │   ├── api.ts             # Axios instance configurada
│   │   │   └── http-client.ts     # HTTP client wrapper
│   │   ├── types/                 # Types globales
│   │   ├── constants/             # Constantes de la app
│   │   └── utils/                 # Helper functions
│   │
│   ├── assets/                    # Imágenes, iconos, etc
│   ├── styles/                    # CSS global, Tailwind config
│   └── main.tsx                   # Entry point
│
├── public/
├── tests/
│   └── setup.ts
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── vitest.config.ts
```

---

## 🎨 Patrones de Diseño

### Backend

#### 1. **Repository Pattern**
**Propósito**: Abstracción de acceso a datos.

```python
# repositories/base.py
class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: int) -> Optional[T]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj: dict) -> T:
        db_obj = self.model(**obj)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    # ... update, delete, etc
```

#### 2. **Service Layer Pattern**
**Propósito**: Encapsular lógica de negocio.

```python
# services/product_service.py
class ProductService:
    def __init__(self, product_repo: ProductRepository, audit_service: AuditService):
        self.product_repo = product_repo
        self.audit_service = audit_service

    def create_product(self, product_data: ProductCreate, user_id: int) -> Product:
        # Validaciones de negocio
        if product_data.stock_min < 0:
            raise ValidationError("Stock mínimo no puede ser negativo")

        # Crear producto
        product = self.product_repo.create(product_data.dict())

        # Registrar en auditoría
        self.audit_service.log_action(
            user_id=user_id,
            action="CREATE",
            entity="product",
            entity_id=product.id
        )

        return product
```

#### 3. **Dependency Injection**
**Propósito**: Desacoplamiento y testabilidad.

```python
# core/dependencies.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_product_repository(db: Session = Depends(get_db)) -> ProductRepository:
    return ProductRepository(Product, db)

def get_product_service(
    product_repo: ProductRepository = Depends(get_product_repository),
    audit_service: AuditService = Depends(get_audit_service)
) -> ProductService:
    return ProductService(product_repo, audit_service)
```

#### 4. **Strategy Pattern** (para reportes)
**Propósito**: Diferentes algoritmos de generación de reportes.

```python
class ReportStrategy(ABC):
    @abstractmethod
    def generate(self, data: dict) -> bytes:
        pass

class PDFReportStrategy(ReportStrategy):
    def generate(self, data: dict) -> bytes:
        # Generar PDF
        pass

class CSVReportStrategy(ReportStrategy):
    def generate(self, data: dict) -> bytes:
        # Generar CSV
        pass

class ReportService:
    def __init__(self, strategy: ReportStrategy):
        self.strategy = strategy

    def create_report(self, data: dict) -> bytes:
        return self.strategy.generate(data)
```

#### 5. **Unit of Work Pattern** (para transacciones complejas)
**Propósito**: Garantizar atomicidad en operaciones multi-entidad.

```python
# Ejemplo: Procesar una venta
class SaleService:
    def process_sale(self, sale_data: SaleCreate, user_id: int) -> Sale:
        with self.db.begin():  # Transacción
            # 1. Crear venta
            sale = self.sale_repo.create(sale_data)

            # 2. Crear sale_items
            for item in sale_data.items:
                self.sale_item_repo.create(item)

            # 3. Reducir stock de cada producto
            for item in sale_data.items:
                self.inventory_service.reduce_stock(
                    product_id=item.product_id,
                    quantity=item.quantity
                )

            # 4. Registrar movimiento de inventario
            self.inventory_service.log_movement(...)

            # 5. Auditoría
            self.audit_service.log_action(...)

            return sale
```

### Frontend

#### 1. **Custom Hooks Pattern**
**Propósito**: Reutilización de lógica.

```typescript
// hooks/useProducts.ts
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, fetchProducts };
};
```

#### 2. **Compound Components Pattern**
**Propósito**: Componentes flexibles y composables.

```typescript
// components/Table/index.tsx
export const Table = ({ children }) => {
  return <table className="...">{children}</table>;
};

Table.Header = ({ children }) => <thead>{children}</thead>;
Table.Body = ({ children }) => <tbody>{children}</tbody>;
Table.Row = ({ children }) => <tr>{children}</tr>;
Table.Cell = ({ children }) => <td>{children}</td>;

// Uso:
<Table>
  <Table.Header>
    <Table.Row>
      <Table.Cell>ID</Table.Cell>
      <Table.Cell>Nombre</Table.Cell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {/* ... */}
  </Table.Body>
</Table>
```

#### 3. **Service Layer Pattern**
**Propósito**: Centralizar llamadas API.

```typescript
// services/productService.ts
class ProductService {
  private client = apiClient;

  async getAll(params?: QueryParams): Promise<Product[]> {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async getById(id: number): Promise<Product> {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  async create(data: ProductCreate): Promise<Product> {
    const response = await this.client.post('/products', data);
    return response.data;
  }

  // ... update, delete
}

export const productService = new ProductService();
```

---

## 🗄 Estructura de Base de Datos

### Modelo Entidad-Relación

```sql
-- USERS (Autenticación y roles)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'seller', 'warehouse_keeper')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES (Clasificación de productos)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SUPPLIERS (Proveedores)
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS (Productos del inventario)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,

    -- Stock
    stock_current INTEGER DEFAULT 0 NOT NULL CHECK (stock_current >= 0),
    stock_min INTEGER DEFAULT 0 NOT NULL,

    -- Precios
    cost DECIMAL(10, 2) NOT NULL,  -- Costo de adquisición
    price DECIMAL(10, 2) NOT NULL, -- Precio de venta

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY_MOVEMENTS (Historial de movimientos)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment')),
    quantity INTEGER NOT NULL,
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_type VARCHAR(50),  -- 'sale', 'purchase', 'manual', etc
    reference_id INTEGER,         -- ID de la venta o compra relacionada
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SALES (Ventas realizadas)
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    sale_number VARCHAR(50) UNIQUE NOT NULL,  -- Ej: SALE-2025-0001
    user_id INTEGER REFERENCES users(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),  -- 'cash', 'card', 'transfer'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SALE_ITEMS (Detalle de productos vendidos)
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT_LOGS (Auditoría de acciones críticas)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE'
    entity_type VARCHAR(50) NOT NULL,  -- 'product', 'sale', etc
    entity_id INTEGER NOT NULL,
    changes JSONB,  -- Almacena los cambios realizados
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES para optimización
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### Principios de Diseño de BD

1. **Normalización hasta 3FN**: Evitar redundancia
2. **Constraints**: Integridad referencial, checks, unique
3. **Indexes**: Para búsquedas frecuentes (SKU, fechas, FKs)
4. **JSONB para flexibilidad**: En audit_logs para cambios dinámicos
5. **Timestamps**: created_at y updated_at en tablas principales
6. **Soft Deletes**: is_active en lugar de borrado físico (cuando aplique)

---

## 🛠 Stack Tecnológico Detallado

### Backend
- **Framework**: FastAPI 0.109+
- **ORM**: SQLAlchemy 2.0+ (async optional para futuro)
- **Migraciones**: Alembic
- **Validación**: Pydantic v2
- **Autenticación**: python-jose (JWT), passlib (bcrypt)
- **Testing**: pytest, pytest-asyncio, httpx
- **Linting**: ruff, black
- **DB**: PostgreSQL 16

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **State Management**: Context API + useReducer (o Zustand si crece)
- **Forms**: React Hook Form + Zod (validación)
- **Charts**: Recharts (para BI)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deploy Backend**: Railway o Render
- **Deploy Frontend**: Vercel
- **Secrets**: .env files (development) → Environment vars (production)

---

## 🌿 Estrategia de Branches y Commits

### Git Flow Simplificado

```
main (producción)
  └── develop (integración)
       ├── feature/auth-module
       ├── feature/products-crud
       ├── feature/inventory-management
       └── feature/sales-module
```

### Estructura de Branches

1. **`main`**: Código en producción (protegido)
2. **`develop`**: Branch de integración (protegido)
3. **`feature/nombre-corto`**: Desarrollo de features
4. **`fix/nombre-bug`**: Corrección de bugs
5. **`refactor/nombre`**: Refactorización
6. **`docs/nombre`**: Solo documentación

### Reglas de Branches

- **NUNCA** commitear directo a `main` o `develop`
- Siempre crear Pull Request de `feature/*` → `develop`
- Merge a `main` solo desde `develop` cuando esté estable
- Borrar feature branches después de merge

### Convención de Commits (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Solo documentación
- `style`: Formato, punto y coma faltante, etc (no cambios de código)
- `refactor`: Refactorización (ni fix ni feat)
- `test`: Agregar o corregir tests
- `chore`: Mantenimiento (actualizar deps, etc)
- `perf`: Mejora de performance
- `ci`: Cambios en CI/CD

**Ejemplos:**
```bash
feat(auth): add JWT authentication with refresh tokens

- Implement login endpoint
- Add token refresh logic
- Create auth middleware for protected routes

Closes #12

---

fix(inventory): prevent negative stock values

Stock was being reduced below zero when processing sales.
Added validation in InventoryService to check available stock.

Fixes #45

---

docs(readme): update setup instructions for Docker

---

refactor(products): extract validation logic to service layer

---

test(sales): add unit tests for SaleService
```

### Workflow de Desarrollo

```bash
# 1. Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/auth-module

# 2. Desarrollar y commitear
git add .
git commit -m "feat(auth): implement user login endpoint"

# 3. Push al remoto
git push origin feature/auth-module

# 4. Crear Pull Request en GitHub (feature/auth-module → develop)

# 5. Code Review + Merge

# 6. Borrar branch local y remota
git checkout develop
git branch -d feature/auth-module
git push origin --delete feature/auth-module
```

---

## 📅 Plan de Sprints

### Sprint 0: Setup e Infraestructura (1 semana)
**Branch**: `feature/project-setup`

**Tareas:**
- [ ] Estructura de carpetas backend
- [ ] Estructura de carpetas frontend
- [ ] Docker Compose (postgres + backend + frontend)
- [ ] Config inicial FastAPI (CORS, middleware, etc)
- [ ] Config inicial React + Vite + Tailwind
- [ ] Conexión DB con SQLAlchemy
- [ ] Alembic configurado
- [ ] Variables de entorno
- [ ] README.md inicial
- [ ] .gitignore configurado

**Entregable**: Proyecto base funcionando con health check

---

### Sprint 1: Autenticación y Usuarios (1 semana)
**Branch**: `feature/auth-module`

**Backend:**
- [ ] Modelo `User` (SQLAlchemy)
- [ ] Schema `UserCreate`, `UserResponse` (Pydantic)
- [ ] Repository `UserRepository`
- [ ] Service `AuthService` (register, login, JWT)
- [ ] Endpoints `/auth/register`, `/auth/login`
- [ ] Middleware de autenticación
- [ ] Dependency `get_current_user`
- [ ] Tests unitarios de AuthService
- [ ] Tests de integración de endpoints

**Frontend:**
- [ ] Login page (UI + form)
- [ ] Register page
- [ ] AuthContext (estado global)
- [ ] authService (API calls)
- [ ] ProtectedRoute component
- [ ] Navbar con logout
- [ ] Manejo de tokens (localStorage + axios interceptors)

**Entregable**: Sistema de login funcional

---

### Sprint 2: Productos y Categorías (1 semana)
**Branch**: `feature/products-module`

**Backend:**
- [ ] Modelos `Product`, `Category`
- [ ] Schemas (CRUD completo)
- [ ] Repositories
- [ ] Services (validación de SKU único, stock, etc)
- [ ] Endpoints CRUD `/products`, `/categories`
- [ ] Filtros y paginación
- [ ] Tests

**Frontend:**
- [ ] ProductsListPage (tabla con paginación)
- [ ] ProductFormPage (crear/editar)
- [ ] CategoriesPage (CRUD simple)
- [ ] ProductCard component
- [ ] productService
- [ ] Validación de formularios (React Hook Form + Zod)

**Entregable**: Gestión completa de productos

---

### Sprint 3: Proveedores (3-4 días)
**Branch**: `feature/suppliers-module`

**Backend:**
- [ ] Modelo `Supplier`
- [ ] CRUD completo
- [ ] Tests

**Frontend:**
- [ ] SuppliersPage (tabla + formulario)
- [ ] Integración con select en ProductForm

**Entregable**: Gestión de proveedores

---

### Sprint 4: Movimientos de Inventario (1 semana)
**Branch**: `feature/inventory-module`

**Backend:**
- [ ] Modelo `InventoryMovement`
- [ ] Service con lógica de:
  - Entrada de stock
  - Salida de stock
  - Ajustes
  - Validaciones (no stock negativo)
  - Creación automática de movimientos
- [ ] Endpoints `/inventory/movements`, `/inventory/adjust`
- [ ] Endpoint `/inventory/alerts` (productos bajo stock mínimo)
- [ ] Tests exhaustivos

**Frontend:**
- [ ] InventoryPage (historial de movimientos)
- [ ] AdjustStockModal
- [ ] Low stock alerts (badge o notificación)
- [ ] Filtros por producto, tipo, fecha

**Entregable**: Sistema de inventario funcional

---

### Sprint 5: Ventas (1 semana)
**Branch**: `feature/sales-module`

**Backend:**
- [ ] Modelos `Sale`, `SaleItem`
- [ ] Service con lógica de:
  - Crear venta
  - Validar stock disponible
  - Reducir stock automáticamente
  - Crear movimientos de inventario
  - Generar número de venta
  - Calcular totales
- [ ] Endpoints `/sales` (CRUD)
- [ ] Endpoint `/sales/{id}/invoice` (detalle completo)
- [ ] Tests de transacciones

**Frontend:**
- [ ] SalesListPage
- [ ] NewSalePage (carrito de productos)
- [ ] SaleDetailPage (factura)
- [ ] Buscador de productos para agregar a venta
- [ ] Cálculo automático de subtotales y total

**Entregable**: Sistema de ventas funcional

---

### Sprint 6: Dashboard y Analytics (BI) (1 semana)
**Branch**: `feature/analytics-module`

**Backend:**
- [ ] Service `AnalyticsService` con queries:
  - Productos más vendidos
  - Ventas por periodo (día, semana, mes)
  - Rotación de inventario
  - Productos con bajo stock
  - Ingresos totales
- [ ] Endpoints `/analytics/sales-summary`, `/analytics/top-products`, etc
- [ ] Optimización de queries (JOINS, aggregations)

**Frontend:**
- [ ] DashboardPage con cards de métricas
- [ ] Gráficos (Recharts):
  - Ventas por día (line chart)
  - Top productos (bar chart)
  - Distribución por categoría (pie chart)
- [ ] Filtros por fecha
- [ ] Indicadores KPI (total ventas, ganancia, etc)

**Entregable**: Dashboard BI funcional

---

### Sprint 7: Reportes y Auditoría (3-4 días)
**Branch**: `feature/reports-audit`

**Backend:**
- [ ] Modelo `AuditLog`
- [ ] Service `AuditService` (automático en CUD operations)
- [ ] Endpoint `/audit-logs`
- [ ] Service `ReportService` con generación PDF/CSV
- [ ] Endpoints `/reports/inventory`, `/reports/sales`

**Frontend:**
- [ ] AuditLogsPage (solo admin)
- [ ] ReportsPage con opciones de descarga
- [ ] Filtros avanzados

**Entregable**: Sistema de auditoría y reportes

---

### Sprint 8: Testing, CI/CD y Deploy (1 semana)
**Branch**: `feature/cicd-deploy`

**Tareas:**
- [ ] Aumentar cobertura de tests (>80%)
- [ ] GitHub Actions workflow:
  - Lint (ruff, black, ESLint)
  - Tests backend
  - Tests frontend
  - Build Docker images
- [ ] Deploy backend a Railway/Render
- [ ] Deploy frontend a Vercel
- [ ] Configurar variables de entorno en producción
- [ ] Documentación final (README, API docs, SETUP.md)
- [ ] Screenshots/GIFs para README

**Entregable**: Aplicación en producción

---

## 📊 Métricas de Calidad

### Backend
- **Cobertura de tests**: >80%
- **Tiempo de respuesta**: <200ms en promedio
- **Code quality**: Ruff + Black (0 warnings)

### Frontend
- **Performance**: Lighthouse >90
- **Accesibilidad**: WCAG 2.1 AA
- **Bundle size**: <500KB (gzipped)

### General
- **Commits**: Conventional Commits 100%
- **PR reviews**: Obligatorio antes de merge
- **Documentación**: Todos los módulos documentados

---

## 🔐 Seguridad

### Implementaciones
1. **Password hashing**: bcrypt
2. **JWT**: HS256, expiración 24h, refresh tokens
3. **CORS**: Whitelist de orígenes permitidos
4. **SQL Injection**: Uso de ORM (parametrized queries)
5. **XSS**: Sanitización en frontend
6. **HTTPS**: En producción obligatorio
7. **Rate limiting**: Para endpoints de login
8. **Secrets**: Nunca en código, siempre env vars

---

## 📚 Referencias

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

---

**Última actualización**: 2025-12-27
**Autor**: César Pantoja
**Versión**: 1.0
