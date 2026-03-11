# PostgreSQL Database Architecture - Software Consultancy Platform

## Table of Contents
1. [Introduction to PostgreSQL](#introduction-to-postgresql)
2. [Why PostgreSQL for This Project](#why-postgresql-for-this-project)
3. [Database Architecture Overview](#database-architecture-overview)
4. [Prisma ORM Integration](#prisma-orm-integration)
5. [Database Schema Design](#database-schema-design)
6. [Key Database Features Implemented](#key-database-features-implemented)
7. [Data Relationships and Foreign Keys](#data-relationships-and-foreign-keys)
8. [Performance Optimization](#performance-optimization)
9. [Data Integrity and Constraints](#data-integrity-and-constraints)
10. [Security Considerations](#security-considerations)
11. [Database Operations Examples](#database-operations-examples)
12. [Database Schema Summary](#database-schema-summary)
13. [FastAPI Backend Architecture](#fastapi-backend-architecture)
14. [Why FastAPI for This Project](#why-fastapi-for-this-project)
15. [Frontend Architecture](#frontend-architecture)
16. [Key Technologies](#key-technologies)
17. [Benefits Summary](#benefits-summary)
18. [Overall System Architecture and Integration](#overall-system-architecture-and-integration)
19. [Conclusion](#conclusion)
20. [Viva Preparation Questions](#viva-preparation-questions)

---

## Introduction to PostgreSQL

PostgreSQL is an advanced, open-source relational database management system (RDBMS) that provides ACID (Atomicity, Consistency, Isolation, Durability) compliance. It is known for its reliability, feature robustness, and performance. In this project, PostgreSQL serves as the primary data storage solution, handling all persistent data operations for the Software Consultancy platform.

### Key Characteristics of PostgreSQL:
- **ACID Compliance**: Ensures data integrity and reliability
- **Relational Model**: Uses tables with defined relationships between data
- **SQL Support**: Full SQL standard compliance with advanced features
- **Extensibility**: Supports custom data types, functions, and extensions
- **Concurrency Control**: Multi-version concurrency control (MVCC) for handling concurrent transactions

---

## Why PostgreSQL for This Project

### 1. **Data Integrity and Reliability**
PostgreSQL's ACID properties ensure that all database transactions are processed reliably. This is crucial for financial transactions, user subscriptions, and booking systems where data consistency is paramount.

**Example Use Case**: When a user subscribes to a plan, the system must:
- Create a subscription record
- Update user payment status
- Record billing history
- All operations must succeed or fail together (atomicity)

### 2. **Complex Relationships**
The platform requires complex relationships between entities:
- Users have multiple subscriptions, bookings, and reviews
- Consultants are linked to team members and reviews

PostgreSQL's foreign key constraints ensure referential integrity, preventing orphaned records and maintaining data consistency.

### 3. **Structured Data with Flexibility**
While maintaining a structured schema, PostgreSQL supports:
- **JSON Fields**: For flexible data storage (e.g., Calendly credentials)
- **Array Types**: For storing lists (e.g., tags, features)
- **Custom Types**: For domain-specific data structures

### 4. **Performance and Scalability**
- **Indexing**: Strategic indexes on frequently queried fields (user IDs, email addresses, dates)
- **Query Optimization**: PostgreSQL's query planner optimizes complex joins and aggregations
- **Connection Pooling**: Efficient connection management through Prisma

### 5. **Transaction Support**
Critical operations require transactions to maintain data consistency:
- Payment processing
- User registration with email verification
- Consultation booking with payment tracking

---

## Database Architecture Overview

The database consists of **core tables** organized into logical domains:

### User Management Domain
- `users`: Admin user accounts
- `public_users`: Customer accounts with authentication and profile data
- `subscribers`: Newsletter subscription management

### Content Management Domain
- `team`: Team member/consultant information
- `analysts`: Calendly integration credentials for consultants

### Business Operations Domain
- `bookings`: Appointment scheduling
- `plans`: Subscription plan definitions
- `subscriptions`: Active user subscriptions
- `payment_methods`: Stored payment methods
- `billing_history`: Transaction records

### User Engagement Domain
- `reviews`: User reviews for consultants

---

## Prisma ORM Integration

### What is Prisma?
Prisma is a next-generation Object-Relational Mapping (ORM) tool that provides:
- **Type Safety**: Auto-generated TypeScript types based on schema
- **Query Builder**: Intuitive API for database operations
- **Migration System**: Version-controlled database schema changes
- **Connection Pooling**: Efficient database connection management

### Prisma Client Usage in the Project

The project uses a singleton pattern for Prisma Client to prevent connection exhaustion:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Benefits of Using Prisma:
1. **Type Safety**: Compile-time type checking prevents runtime errors
2. **Developer Experience**: IntelliSense and autocomplete for all database operations
3. **Migration Management**: Schema changes are tracked and versioned
4. **Query Optimization**: Prisma optimizes queries automatically

---

## Database Schema Design

### Primary Keys and UUIDs
All tables use **UUID (Universally Unique Identifier)** as primary keys:
- **Benefits**: Globally unique, non-sequential (security), distributed system friendly
- **Format**: `550e8400-e29b-41d4-a716-446655440000`
- **Implementation**: `@id @default(uuid())` in Prisma schema

### Foreign Key Relationships
Foreign keys enforce referential integrity:

```prisma
model Subscription {
  userId String
  user   PublicUser @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Cascade Deletion**: When a user is deleted, all related subscriptions are automatically removed, preventing orphaned records.

### Indexes for Performance
Strategic indexes on frequently queried fields:

```prisma
model Booking {
  @@index([clientEmail])
  @@index([date])
  @@index([stripeSessionId])
}
```

**Index Benefits**:
- Faster query execution
- Efficient sorting and filtering
- Optimized join operations

### Data Types Used

1. **String**: Text data (names, emails, descriptions)
2. **Int**: Numeric IDs and counts (teamId, analystId, rating)
3. **Float**: Decimal numbers (prices, amounts)
4. **Boolean**: True/false flags (isPaid, isActive, emailVerified)
5. **DateTime**: Timestamps (createdAt, updatedAt, dates)
6. **Json**: Flexible nested data (Calendly config)
7. **String[]**: Array of strings (tags, features)

---

## Key Database Features Implemented

### 1. ACID Transactions
PostgreSQL ensures all-or-nothing operations:

**Example**: User subscription creation
```typescript
// All operations succeed or fail together
await prisma.$transaction(async (tx) => {
  const subscription = await tx.subscription.create({...});
  await tx.billingHistory.create({...});
  await tx.publicUser.update({...});
});
```

### 2. Data Validation
- **Unique Constraints**: Email addresses, usernames, slugs
- **Required Fields**: Critical data cannot be null
- **Type Safety**: Prisma enforces correct data types at compile time

### 3. Automatic Timestamps
```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```
- `createdAt`: Set once when record is created
- `updatedAt`: Automatically updated on every modification

### 4. Soft Deletes (Status-based)
Instead of hard deletes, records use status fields:
- `status`: 'pending' | 'confirmed' | 'completed' | 'cancelled'
- Allows data recovery and audit trails

### 5. JSON Storage for Flexible Data
```prisma
calendly Json? // { enabled: boolean, userUri: string, accessToken: string }
```
Stores complex nested objects while maintaining queryability.

---

## Data Relationships and Foreign Keys

### One-to-Many Relationships

**User → Subscriptions**
```prisma
model PublicUser {
  subscriptions Subscription[]
}

model Subscription {
  userId String
  user   PublicUser @relation(fields: [userId], references: [id])
}
```
One user can have multiple subscriptions (historical data).

### One-to-One Relationships

**Team Member → Analyst**
```prisma
model TeamMember {
  analyst Analyst?
}

model Analyst {
  analystId Int @unique
  teamMember TeamMember? @relation(fields: [analystId], references: [teamId])
}
```
Not all team members have Calendly integration (optional relationship).

---

## Performance Optimization

### 1. Strategic Indexing
Indexes are created on:
- **Primary Keys**: Automatically indexed
- **Foreign Keys**: For efficient joins
- **Frequently Queried Fields**: Email, dates, status fields
- **Unique Constraints**: Automatically indexed

### 2. Query Optimization
- **Selective Field Loading**: Only fetch required fields
- **Eager Loading**: Use `include` to fetch related data in single query
- **Pagination**: Limit results to prevent large data transfers

### 3. Connection Pooling
Prisma manages connection pools automatically:
- Reuses connections efficiently
- Prevents connection exhaustion
- Optimizes for serverless environments

### 4. Aggregation Queries
Efficient statistical queries:
```typescript
const stats = await prisma.review.aggregate({
  where: { analystId, status: 'approved' },
  _count: { id: true },
  _avg: { rating: true },
});
```

---

## Data Integrity and Constraints

### 1. Referential Integrity
Foreign keys ensure:
- Cannot create subscription without valid user
- Cannot create review without valid consultant
- Deleting user cascades to related records (or sets to null)

### 2. Unique Constraints
Prevents duplicate data:
- Email addresses (one account per email)
- Usernames (unique admin accounts)
- Stripe IDs (prevent duplicate payment records)

### 3. Check Constraints (Implicit)
- Ratings: 1-5 scale enforced in application logic
- Status values: Enforced through TypeScript types
- Date validation: Registration dates must be valid

### 4. Not Null Constraints
Critical fields cannot be empty:
- User email, password
- Subscription status

---

## Security Considerations

### 1. Password Storage
- Passwords are hashed using bcrypt before storage
- Never stored in plain text
- Secure comparison using bcrypt's compare function

### 2. Sensitive Data Encryption
- **Calendly Tokens**: Access tokens stored securely in JSON fields
- **Payment Data**: Only Stripe IDs stored, actual payment data handled by Stripe

### 3. SQL Injection Prevention
Prisma uses parameterized queries:
```typescript
// Safe - Prisma handles parameterization
await prisma.user.findUnique({
  where: { email: userInput }
});
```

### 4. Access Control
- Database-level constraints prevent unauthorized data access
- Application-level authentication required for sensitive operations
- Row-level security considerations for multi-tenant scenarios

---

## Database Operations Examples

### Creating Records
```typescript
const user = await prisma.publicUser.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    name: 'John Doe',
  },
});
```

### Querying with Relations
```typescript
const userWithSubscriptions = await prisma.publicUser.findUnique({
  where: { id: userId },
  include: {
    subscriptions: true,
    bookings: true,
    reviews: true,
  },
});
```

### Updating Records
```typescript
await prisma.publicUser.update({
  where: { id: userId },
  data: {
    emailVerified: true,
    subscriptionStatus: 'active',
  },
});
```

### Complex Queries
```typescript
const activeSubscriptions = await prisma.subscription.findMany({
  where: {
    userId: userId,
    status: 'active',
    cancelAtPeriodEnd: false,
  },
  include: {
    plan: true,
    billingHistory: {
      orderBy: { invoiceDate: 'desc' },
      take: 10,
    },
  },
});
```

### Transactions
```typescript
await prisma.$transaction(async (tx) => {
  const subscription = await tx.subscription.create({...});
  await tx.billingHistory.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.stripeSubscriptionId,
      amount: subscription.price,
    },
  });
});
```

---

## Database Schema Summary

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | Admin accounts | Simple authentication |
| `public_users` | Customer accounts | Full profile, subscriptions, bookings |
| `team` | Team members/consultants | Public-facing team information |
| `analysts` | Calendly integration | JSON credentials storage |
| `plans` | Subscription plans | Feature lists, pricing |
| `subscriptions` | Active subscriptions | Stripe integration, billing cycles |
| `payment_methods` | Stored cards | Secure payment method storage |
| `billing_history` | Transaction records | Complete payment audit trail |
| `bookings` | Appointments | Calendly integration, scheduling |
| `reviews` | User reviews | Moderation workflow (pending/approved) |
| `subscribers` | Newsletter | Email subscription management |

---

## FastAPI Backend Architecture

### Introduction to FastAPI

FastAPI is a modern, high-performance web framework for building APIs with Python. It is built on top of Starlette and Pydantic, providing automatic API documentation, data validation, and excellent performance. In this project, FastAPI serves as the backend API service, handling all server-side logic, database operations, and third-party integrations.

### Key Characteristics of FastAPI:
- **High Performance**: Comparable to Node.js and Go, thanks to async/await support
- **Automatic Documentation**: Interactive API docs (Swagger UI) generated automatically
- **Type Safety**: Uses Python type hints and Pydantic for data validation
- **Async Support**: Native support for asynchronous operations
- **Standards-Based**: Built on OpenAPI (formerly Swagger) and JSON Schema standards

---

## Why FastAPI for This Project

### 1. **Automatic API Documentation**
FastAPI automatically generates interactive API documentation from your code, making it easy to test and understand endpoints.

**Example**: When you visit `http://localhost:8000/docs`, you get a complete Swagger UI showing:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication requirements

This eliminates the need for separate documentation and ensures it's always up-to-date with the code.

### 2. **Type Safety and Data Validation**
FastAPI uses Pydantic models to automatically validate request and response data, catching errors before they reach your business logic.

**Example from the Project**:
```python
class LoginRequest(BaseModel):
    username: str
    password: str

@admin_auth_router.post("/login", response_model=LoginResponse)
async def admin_login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    # FastAPI automatically validates that request contains username and password
    # Returns 422 error if validation fails
```

**Benefits**:
- Invalid data is rejected automatically
- Type hints provide IDE autocomplete
- Reduces boilerplate validation code

### 3. **Dependency Injection System**
FastAPI's dependency injection makes it easy to share common functionality across endpoints, such as database connections and authentication.

**Example from the Project**:
```python
# Database dependency - automatically provides a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication dependency - extracts user ID from JWT token
async def get_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    # Reads token from cookie or Authorization header
    # Returns user ID if authenticated, None otherwise
    ...

# Usage in endpoints
@router.get("/team")
async def get_team(db: Session = Depends(get_db)):
    # db is automatically provided by FastAPI
    result = db.execute(text("SELECT ..."))
    ...
```

**Benefits**:
- Clean, reusable code
- Easy to test (dependencies can be mocked)
- Automatic resource cleanup (database connections closed automatically)

### 4. **Async/Await Support**
FastAPI supports asynchronous operations, allowing multiple requests to be handled concurrently without blocking.

**Example**: When fetching team data, the server can handle other requests while waiting for the database query to complete:
```python
@router.get("")
async def get_team(db: Session = Depends(get_db)):
    # This is async - doesn't block other requests
    result = db.execute(text("SELECT ..."))
    ...
```

**Benefits**:
- Better performance under load
- Efficient resource utilization
- Can handle thousands of concurrent connections

### 5. **CORS and Security**
FastAPI provides built-in middleware for handling Cross-Origin Resource Sharing (CORS), essential for frontend-backend communication.

**Example from the Project**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # ["http://localhost:3000"]
    allow_credentials=True,      # Allows cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This allows the Next.js frontend (running on port 3000) to make requests to the FastAPI backend (running on port 8000) while maintaining security.

### 6. **Structured Project Organization**
The FastAPI backend follows a clean, modular structure:

```
backend/
├── app/
│   ├── api/
│   │   └── v1/          # API route handlers (team, auth, reviews, etc.)
│   ├── core/            # Core utilities (config, database, security)
│   ├── models/           # SQLAlchemy database models
│   └── main.py          # FastAPI application entry point
├── requirements.txt     # Python dependencies
└── run.py              # Server startup script
```

**Benefits**:
- Easy to navigate and maintain
- Clear separation of concerns
- Scalable architecture

### 7. **Integration with SQLAlchemy**
FastAPI works seamlessly with SQLAlchemy for database operations, providing type-safe database access.

**Example from the Project**:
```python
# Database connection setup
engine = create_engine(
    database_url,
    pool_pre_ping=True,      # Verify connections before use
    pool_size=10,            # Connection pool size
    max_overflow=20,         # Additional connections if needed
)

# Session management
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Usage in endpoints
@router.get("")
async def get_team(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT ... FROM team"))
    ...
```

**Benefits**:
- Connection pooling for efficiency
- Automatic connection cleanup
- Type-safe database queries

### 8. **Error Handling**
FastAPI provides clear error responses with appropriate HTTP status codes.

**Example from the Project**:
```python
if not user_row:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )
```

**Benefits**:
- Consistent error responses
- Proper HTTP status codes
- Clear error messages for debugging

---

## Frontend Architecture

### Framework and Core Libraries

**Next.js 15.5.7** - React framework with App Router
- Server-side rendering (SSR) and static site generation (SSG)
- File-based routing system
- Image optimization and automatic code splitting

**React 19.1.2** - UI library
- Component-based architecture
- Client-side interactivity with hooks
- Context API for state management

**TypeScript 5** - Type safety
- Compile-time error checking
- Enhanced IDE support and autocomplete

### Styling and UI

**Tailwind CSS 4** - Utility-first CSS framework
- Responsive design utilities
- Custom color palette and spacing
- Dark theme implementation

**Custom Fonts** - Gilroy font family
- Gilroy-Medium and Gilroy-SemiBold variants
- Preloaded for performance
- Applied globally via CSS

### Component Architecture

#### Layout Components
- **Navbar** - Responsive navigation with mobile menu
- **Footer** - Site footer with links and social media
- **MinimalBackground** - Subtle gradient and grid pattern background
- **TechAnimations** - Animated tech elements (code symbols, circuit boards, binary streams)

#### Page Components
- **ConsultancyHero** - Landing page hero section with animated stats
- **ServicesSection** - Grid of consultancy services
- **TechnologyStack** - Scrolling technology badges
- **MeetingsPage** - Multi-step consultation booking flow
- **ReviewsPage** - Client reviews display and submission

#### Reusable Components
- **CustomButton** - Styled button component
- **CustomInput** - Form input with validation
- **LoadingScreen** - Loading state indicator
- **ErrorBoundary** - Error handling wrapper

### State Management

**React Context API** - Global state
- `AuthContext` - User authentication state
- Session management and token handling

**Local State** - Component-level state
- `useState` hooks for form data and UI state
- `useEffect` for side effects and data fetching

### Routing Structure

```
/app
  /page.tsx              - Landing page
  /meetings/page.tsx     - Consultation booking
  /reviews/page.tsx      - Client reviews
  /booking-success/page.tsx - Booking confirmation
  /admin                 - Admin dashboard
    /dashboard           - Admin overview
    /team                - Team management
    /reviews             - Review moderation
```

### API Integration

**FastAPI Backend** - RESTful API service
- `/api/team` - Fetch consultant data
- `/api/reviews` - Review CRUD operations
- `/api/calendly/*` - Calendly integration
- `/api/stripe/*` - Payment processing
- `/api/auth/*` - Authentication endpoints

**Client-side Fetching** - Data retrieval
- `fetch()` API for HTTP requests with `credentials: 'include'` for cookies
- Error handling and loading states
- Session storage for caching

### Animations and Interactions

**CSS Animations** - Custom keyframes
- Floating tech elements
- Smooth transitions
- Pulse and fade effects

**React Hooks** - Interactive features
- Scroll detection for navbar
- Form validation
- Modal and dropdown management

---

## Key Technologies

### Frontend Stack
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icon library

### Backend Stack
- **FastAPI** - Python web framework for APIs
- **SQLAlchemy** - Python database ORM
- **Prisma** - Database ORM (for migrations and schema management)
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Third-Party Integrations
- **Stripe** - Payment processing
- **Calendly** - Appointment scheduling
- **AWS S3** - File storage
- **Nodemailer** - Email sending

---

## Benefits Summary

### Why PostgreSQL?
1. **ACID Compliance**: Ensures data reliability for financial transactions
2. **Referential Integrity**: Foreign keys prevent data inconsistencies
3. **Performance**: Indexes and query optimization for fast responses
4. **Scalability**: Handles growing data volumes efficiently
5. **Flexibility**: JSON fields for complex data while maintaining structure
6. **Type Safety**: Prisma provides compile-time type checking
7. **Developer Experience**: Intuitive ORM reduces development time
8. **Security**: Built-in protection against SQL injection
9. **Transactions**: Ensures all-or-nothing operations
10. **Standards Compliance**: SQL standard ensures portability

### Technical Advantages
- **Relational Model**: Natural representation of business entities and relationships
- **Query Optimization**: PostgreSQL's query planner optimizes complex queries
- **Concurrency**: MVCC handles multiple simultaneous transactions
- **Extensibility**: Can add custom functions and data types
- **Open Source**: No licensing costs, active community support

---

---

## Overall System Architecture and Integration

### Three-Layer Architecture

The Software Consultancy platform follows a three-layer architecture, with each layer handling specific responsibilities:

#### 1. **Frontend Layer (Next.js + React)**
**Location**: Root directory (`src/`, `app/`)
**Technology**: Next.js 15, React 19, TypeScript, Tailwind CSS
**Responsibilities**:
- User interface and user experience
- Client-side routing and navigation
- Form handling and validation
- State management (React Context API)
- API communication with backend

**Example Flow**: When a user visits the meetings page:
1. React component renders the UI
2. Component fetches team data from FastAPI: `fetch('http://localhost:8000/api/team')`
3. Displays consultants with their availability
4. User selects a consultant and books a meeting
5. Form data is sent to FastAPI: `POST /api/calendly/availability`

#### 2. **Backend API Layer (FastAPI)**
**Location**: `backend/app/`
**Technology**: FastAPI, Python, SQLAlchemy
**Responsibilities**:
- Business logic and data processing
- Authentication and authorization
- Database operations
- Third-party API integrations (Stripe, Calendly, AWS S3)
- Data validation and error handling

**Example Flow**: When frontend requests team data:
1. FastAPI receives GET request at `/api/team`
2. Dependency injection provides database session
3. SQLAlchemy executes query: `SELECT * FROM team`
4. Data is transformed and validated
5. JSON response sent back to frontend

#### 3. **Database Layer (PostgreSQL)**
**Location**: External PostgreSQL server
**Technology**: PostgreSQL, Prisma (for migrations)
**Responsibilities**:
- Persistent data storage
- Data integrity and constraints
- Transaction management
- Query optimization

**Example Flow**: When storing a new subscription:
1. FastAPI receives subscription data
2. SQLAlchemy creates database transaction
3. PostgreSQL validates constraints (foreign keys, unique constraints)
4. Data is committed atomically
5. Success response returned to FastAPI, then to frontend

### How the Layers Interact

#### Request Flow Example: User Login

1. **Frontend** (`src/app/admin/login/page.tsx`):
   ```typescript
   const response = await fetch('http://localhost:8000/api/admin/api/auth/login', {
     method: 'POST',
     credentials: 'include',  // Important for cookies
     body: JSON.stringify({ username, password })
   });
   ```

2. **Backend** (`backend/app/api/v1/auth.py`):
   ```python
   @admin_auth_router.post("/login")
   async def admin_login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
       # 1. Validate input (automatic via Pydantic)
       # 2. Query database for user
       result = db.execute(text("SELECT ... FROM users WHERE username = :username"))
       # 3. Verify password
       if verify_password(request.password, hashed_password):
           # 4. Generate JWT token
           token = create_access_token({"userId": user_id})
           # 5. Set cookie
           response.set_cookie(key="auth-token", value=token, ...)
           # 6. Return success response
   ```

3. **Database** (PostgreSQL):
   - Receives SQL query from SQLAlchemy
   - Executes query using indexes for fast lookup
   - Returns user data
   - Transaction ensures data consistency

4. **Response Flow**:
   - FastAPI returns JSON response with user data
   - Cookie is set in browser automatically
   - Frontend receives response and redirects to dashboard

#### Data Flow Example: Fetching Team Members

1. **Frontend Request**:
   ```typescript
   fetch('http://localhost:8000/api/team', { credentials: 'include' })
   ```

2. **Backend Processing**:
   ```python
   @router.get("")
   async def get_team(db: Session = Depends(get_db)):
       # SQLAlchemy executes raw SQL (compatible with Prisma schema)
       result = db.execute(text("SELECT \"teamId\", name, role, ... FROM team"))
       # Transform data for frontend
       analysts = [transform_member(m) for m in result.fetchall()]
       return {"team": analysts}
   ```

3. **Database Query**:
   - PostgreSQL executes SELECT query
   - Uses indexes on `teamId` for fast retrieval
   - Returns all team member records

4. **Response**:
   - FastAPI serializes Python dict to JSON
   - CORS middleware adds appropriate headers
   - Frontend receives JSON and renders UI

### Key Integration Points

#### 1. **Authentication Flow**
- **Frontend**: Stores JWT token in HTTP-only cookie (set by backend)
- **Backend**: Validates token on protected endpoints using dependency injection
- **Database**: Stores user credentials securely (hashed passwords)

#### 2. **Database Access**
- **Prisma**: Handles schema migrations and type generation
- **SQLAlchemy**: Used by FastAPI for runtime database operations
- **PostgreSQL**: Stores all persistent data with ACID guarantees

#### 3. **CORS Configuration**
- **Backend**: Configured to accept requests from `http://localhost:3000`
- **Frontend**: Sends requests with `credentials: 'include'` to send cookies
- **Security**: Only specified origins can access the API

#### 4. **Error Handling**
- **Database Errors**: Caught by SQLAlchemy, converted to HTTP errors by FastAPI
- **Validation Errors**: Pydantic automatically returns 422 for invalid data
- **Frontend**: Displays user-friendly error messages

### Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a clear responsibility
2. **Scalability**: Each layer can be scaled independently
3. **Maintainability**: Changes in one layer don't affect others
4. **Type Safety**: TypeScript (frontend) and Python type hints (backend) catch errors early
5. **Developer Experience**: Automatic documentation, type checking, and hot reloading
6. **Performance**: Async operations, connection pooling, and efficient queries

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | User interface and client-side logic |
| **Backend API** | FastAPI, Python, SQLAlchemy | Business logic and API endpoints |
| **Database** | PostgreSQL, Prisma, SQLAlchemy | Data persistence and management |
| **Authentication** | JWT, bcrypt, HTTP-only cookies | Secure user authentication |
| **Integrations** | Stripe, Calendly, AWS S3 | Third-party services |

---

## Conclusion

The Software Consultancy platform uses a modern, three-layer architecture that separates concerns and ensures scalability, maintainability, and performance.

**PostgreSQL** provides a robust, ACID-compliant foundation for data storage, ensuring data integrity through foreign keys, constraints, and transactions. **Prisma** manages schema migrations and provides type-safe database access, while **SQLAlchemy** enables FastAPI to perform efficient database operations.

**FastAPI** serves as the backend API layer, providing high performance, automatic documentation, type safety, and seamless integration with the database. Its dependency injection system, async support, and built-in validation make it ideal for building robust APIs.

**Next.js and React** form the frontend layer, delivering a modern, responsive user interface with server-side rendering capabilities, efficient state management, and seamless integration with the FastAPI backend through RESTful API calls.

Together, these technologies create a powerful, type-safe, and maintainable platform that supports the business requirements while ensuring data integrity, optimal performance, and excellent developer experience.

---

## Viva Preparation Questions

### PostgreSQL Database Questions

1. **What is PostgreSQL and why did you choose it for this project?**
   - PostgreSQL is an advanced, open-source relational database management system (RDBMS) that provides ACID compliance.
   - Chosen for data integrity (ACID properties), complex relationships (foreign keys), structured data with flexibility (JSON fields), performance (indexing), and transaction support.

2. **Explain ACID properties and how they benefit your project.**
   - **Atomicity**: All operations in a transaction succeed or fail together (e.g., subscription creation updates multiple tables atomically)
   - **Consistency**: Data remains valid according to defined rules (foreign keys, constraints)
   - **Isolation**: Concurrent transactions don't interfere with each other
   - **Durability**: Committed data persists even after system failures

3. **What are foreign keys and how do you use them in your database?**
   - Foreign keys enforce referential integrity between tables
   - Example: `Subscription.userId` references `PublicUser.id`
   - Prevents orphaned records and ensures data consistency
   - Can cascade deletes or set to null when parent record is deleted

4. **How do indexes improve database performance?**
   - Indexes create data structures that speed up queries
   - Example: Index on `clientEmail` in `bookings` table makes email lookups fast
   - Trade-off: Slightly slower writes, much faster reads
   - Used on frequently queried fields like email, dates, and foreign keys

5. **What is the difference between a primary key and a unique constraint?**
   - Primary key: Uniquely identifies each row, cannot be null, only one per table
   - Unique constraint: Ensures no duplicate values, can have multiple per table, allows null (but only one null)
   - Example: `email` has unique constraint in `public_users` table

6. **How do you handle database migrations in your project?**
   - Prisma handles migrations through `prisma migrate dev`
   - Migrations are version-controlled SQL files
   - Ensures database schema matches code across different environments
   - Example: Adding a new field to a model generates a migration file

### Prisma ORM Questions

7. **What is Prisma and what are its main benefits?**
   - Prisma is a next-generation ORM (Object-Relational Mapping) tool
   - Benefits: Type safety (auto-generated TypeScript types), intuitive query API, migration system, connection pooling
   - Provides compile-time type checking and IntelliSense support

8. **How does Prisma ensure type safety?**
   - Prisma generates TypeScript types from your schema
   - Example: `prisma.publicUser.findUnique({ where: { email: ... } })` is type-checked
   - Catches errors at compile time, not runtime
   - IDE provides autocomplete for all database operations

9. **Explain the Prisma Client singleton pattern used in your project.**
   ```typescript
   const globalForPrisma = global as unknown as { prisma: PrismaClient };
   export const prisma = globalForPrisma.prisma || new PrismaClient();
   ```
   - Prevents multiple Prisma Client instances in development (hot reloading)
   - Reuses the same connection pool
   - Prevents connection exhaustion

10. **What is the difference between `include` and `select` in Prisma queries?**
    - `include`: Fetches related data (e.g., `include: { subscriptions: true }`)
    - `select`: Specifies which fields to fetch (e.g., `select: { id: true, email: true }`)
    - `include` adds related data, `select` limits fields from the main model

### FastAPI Backend Questions

11. **What is FastAPI and why did you choose it?**
    - FastAPI is a modern, high-performance Python web framework for building APIs
    - Chosen for: Automatic API documentation, type safety with Pydantic, async support, dependency injection, high performance

12. **How does FastAPI automatically generate API documentation?**
    - FastAPI uses Python type hints and Pydantic models
    - Automatically creates OpenAPI schema
    - Swagger UI available at `/docs` endpoint
    - Documentation is always in sync with code

13. **Explain FastAPI's dependency injection system with an example from your project.**
    - Dependencies are functions that FastAPI calls before your endpoint
    - Example: `get_db()` provides database session, `get_current_user_id()` extracts user from JWT
    - Benefits: Reusable code, easy testing, automatic resource cleanup
    - Usage: `async def get_team(db: Session = Depends(get_db))`

14. **How does FastAPI handle authentication in your project?**
    - Uses dependency injection: `get_current_user_id()` reads JWT token from cookie or Authorization header
    - Token is verified using `verify_token()` function
    - Returns user ID if authenticated, None otherwise
    - Protected endpoints use `Depends(get_current_user_id)` or `Depends(require_auth)`

15. **What is CORS and how is it configured in your FastAPI backend?**
    - CORS (Cross-Origin Resource Sharing) allows frontend (port 3000) to request backend (port 8000)
    - Configured via `CORSMiddleware` with allowed origins, credentials, methods, and headers
    - Essential for frontend-backend communication in separate applications

16. **How does async/await improve performance in FastAPI?**
    - Async endpoints can handle multiple requests concurrently
    - While waiting for database query, server can process other requests
    - Better resource utilization and higher throughput
    - Example: `async def get_team(...)` doesn't block other requests

17. **Explain how Pydantic models provide data validation in FastAPI.**
    - Pydantic models define expected data structure with type hints
    - FastAPI automatically validates incoming requests against the model
    - Invalid data returns 422 error before reaching your code
    - Example: `LoginRequest` ensures `username` and `password` are strings

### SQLAlchemy Integration Questions

18. **How does SQLAlchemy work with FastAPI in your project?**
    - SQLAlchemy provides database connection and query interface
    - `get_db()` dependency provides database session to endpoints
    - Sessions are automatically closed after request completes
    - Connection pooling manages database connections efficiently

19. **Why do you use both Prisma and SQLAlchemy?**
    - Prisma: Handles schema migrations and provides type generation
    - SQLAlchemy: Used by FastAPI for runtime database operations
    - Prisma manages the schema, SQLAlchemy executes queries
    - Both work with the same PostgreSQL database

20. **How does connection pooling work in your project?**
    - SQLAlchemy maintains a pool of database connections
    - `pool_size=10`: Keeps 10 connections ready
    - `max_overflow=20`: Can create 20 more if needed
    - Reuses connections instead of creating new ones for each request

### Frontend Architecture Questions

21. **What is Next.js and how does it differ from regular React?**
    - Next.js is a React framework with additional features
    - Provides: Server-side rendering, file-based routing, API routes, image optimization
    - Better performance and SEO compared to client-only React apps

22. **How does the frontend communicate with the FastAPI backend?**
    - Uses `fetch()` API with `credentials: 'include'` to send cookies
    - Requests go to `http://localhost:8000/api/*` endpoints
    - CORS middleware allows cross-origin requests
    - Cookies are automatically sent for authentication

23. **Explain React Context API and how you use it for authentication.**
    - Context API provides global state management
    - `AuthContext` stores current user information
    - Components can access auth state without prop drilling
    - Updates when user logs in/out

24. **What is the purpose of TypeScript in your frontend?**
    - TypeScript adds type checking to JavaScript
    - Catches errors at compile time
    - Provides IDE autocomplete and better refactoring
    - Example: Type-safe API responses prevent runtime errors

### System Integration Questions

25. **Walk through the complete flow when a user logs in.**
    - Frontend sends POST request to `/api/admin/api/auth/login` with username/password
    - FastAPI validates input (Pydantic), queries database for user
    - Password is verified using bcrypt
    - JWT token is generated and set as HTTP-only cookie
    - Frontend receives success response and redirects to dashboard
    - Subsequent requests include cookie automatically

26. **How does the three-layer architecture benefit your project?**
    - **Separation of Concerns**: Each layer has specific responsibilities
    - **Scalability**: Layers can be scaled independently
    - **Maintainability**: Changes in one layer don't affect others
    - **Testing**: Each layer can be tested separately

27. **Explain how data flows from database to frontend when fetching team members.**
    - Frontend: `fetch('/api/team')` sends GET request
    - FastAPI: Receives request, `get_db()` provides database session
    - SQLAlchemy: Executes `SELECT * FROM team` query
    - PostgreSQL: Returns data using indexes for fast retrieval
    - FastAPI: Transforms data, serializes to JSON
    - Frontend: Receives JSON, renders UI with team member cards

28. **How do you ensure data consistency across multiple database operations?**
    - Use database transactions (ACID properties)
    - Example: Creating subscription updates multiple tables atomically
    - If any operation fails, entire transaction is rolled back
    - Ensures data never in inconsistent state

29. **What security measures are implemented in your authentication system?**
    - Passwords hashed with bcrypt (never stored in plain text)
    - JWT tokens for stateless authentication
    - HTTP-only cookies prevent XSS attacks
    - CORS restricts which origins can access API
    - SQL injection prevented by parameterized queries (SQLAlchemy)

30. **How would you scale this application if it had thousands of users?**
    - **Database**: Add read replicas, optimize queries, add more indexes
    - **Backend**: Horizontal scaling (multiple FastAPI instances), load balancing
    - **Frontend**: CDN for static assets, server-side rendering caching
    - **Caching**: Redis for frequently accessed data
    - **Connection Pooling**: Already implemented, can increase pool size

### Practical Implementation Questions

31. **How do you handle errors in your FastAPI endpoints?**
    - Use `HTTPException` with appropriate status codes
    - Example: `raise HTTPException(status_code=401, detail="Invalid credentials")`
    - FastAPI automatically converts to JSON error response
    - Frontend catches errors and displays user-friendly messages

32. **What is the difference between GET and POST requests in your API?**
    - GET: Retrieves data (e.g., `/api/team` fetches team members)
    - POST: Creates/updates data (e.g., `/api/admin/api/auth/login` authenticates user)
    - GET requests are idempotent (same request = same result)
    - POST requests can have side effects (create records, send emails)

33. **How do you validate user input in FastAPI?**
    - Pydantic models automatically validate request bodies
    - Type hints ensure correct data types
    - Invalid data returns 422 error with details
    - Example: `LoginRequest` ensures username and password are strings

34. **Explain the role of middleware in FastAPI.**
    - Middleware processes requests before they reach endpoints
    - CORS middleware adds headers to allow cross-origin requests
    - Runs for every request automatically
    - Can modify request/response or add logging

35. **How does your project handle database schema changes?**
    - Prisma migrations: `prisma migrate dev` creates migration files
    - Migrations are SQL files that modify database structure
    - Version controlled, can be applied to different environments
    - SQLAlchemy models updated to match new schema

### Architecture and Design Questions

36. **Why use a RESTful API architecture?**
    - Standard HTTP methods (GET, POST, PUT, DELETE) for different operations
    - Stateless: Each request contains all needed information
    - Cacheable: GET requests can be cached
    - Easy to understand and integrate with frontend

37. **What is the benefit of using UUIDs instead of auto-incrementing IDs?**
    - UUIDs are globally unique (no collisions across systems)
    - Non-sequential (better security, can't guess other IDs)
    - Distributed system friendly
    - Example: `550e8400-e29b-41d4-a716-446655440000`

38. **How does your project handle concurrent user requests?**
    - FastAPI's async support handles multiple requests concurrently
    - Database connection pooling manages multiple queries
    - PostgreSQL's MVCC (Multi-Version Concurrency Control) handles concurrent transactions
    - No blocking - server can process other requests while waiting for database

39. **What is the purpose of environment variables in your project?**
    - Store sensitive configuration (database URL, API keys, secrets)
    - Different values for development, staging, production
    - Never committed to version control
    - Example: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`

40. **How would you add a new feature (e.g., user notifications) to your system?**
    - **Database**: Add `notifications` table with Prisma migration
    - **Backend**: Create FastAPI endpoint `/api/notifications` with CRUD operations
    - **Frontend**: Create React component to display notifications
    - **Integration**: Connect frontend to new API endpoint
    - Follow existing patterns for consistency
