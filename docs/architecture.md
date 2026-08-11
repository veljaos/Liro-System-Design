# Architecture — data, forms, templates

How three layers of the system work and why they are built that way. Condensed from the phase reports written during the initial build; the reports themselves are gone, and the code is the source of truth.

## Where the detail lives

* **Data adapter layer**: the `DataProvider` contract and the boundary between UI and backend. The interface itself, with its reasoning, is in `packages/data/src/types.ts`.
* **Form engine**: the "form as data" paradigm. `FieldSchema` and the Standard Schema adapter are in `packages/forms/src/types.ts` and `packages/forms/src/validation.ts`.
* **Templates and shell**: the page templates layer and the full `AppConfig`. See `packages/ui/src/app/LiroAppProvider.tsx` and `packages/templates/src/AppShellTemplate.tsx`.

---

## Architecture by layer

## Data Adapter Layer
The data layer is intentionally decoupled into an interface and an implementation to prevent direct database calls from UI components. 

* **Agnostic Interface**: A generic data provider interface handles standard CRUD operations alongside a generic `call` method for custom procedures.
* **Separation of Concerns**: Custom business logic, calculations, and integrations are executed through the generic call method, keeping the UI design system completely unaware of backend operations.
* **Global State Management**: The interface pairs with data-fetching hooks that use standardized cache keys, ensuring that data invalidations affect exactly the right components system-wide.
* **Backend Implementations**: Specific provider implementations manage backend-centric logic, such as search term sanitization, complex filtering mechanisms, pagination formatting, and translating raw database error codes into user-friendly formats.
* **In-Memory Testing**: An in-memory data provider exists for testing purposes and to guarantee that the core interface remains strictly independent of any specific database architecture.

## Form Engine
The form engine treats form schemas as data to maintain strict consistency across complex data entry screens.

* **Schema-Driven Rendering**: The engine supports numerous input types (text, currency, dates, relational fields, file uploads) alongside structural layout elements like rows, tabs, and sections.
* **Optimized Data Entry**: Input fields are designed around actual user behavior, such as accepting multiple plain-text date formats without causing time-zone shifting issues.
* **Relational Data Handling**: Dropdowns for relational data utilize server-side debounced searching to handle large datasets efficiently. They also support dependency logic, where selecting an option in one field automatically filters the available options in another.
* **Targeted Performance**: Conditional logic is explicitly mapped to specific fields to prevent massive forms from unnecessarily re-rendering on every keystroke. 
* **Data Sanitization**: Hidden or conditional fields are automatically stripped from the final payload before saving to prevent unwanted data mutation.
* **Decoupled File Storage**: File uploading infrastructure is intentionally separated from the main data provider, allowing the system to easily use different backend services for databases and file storage.

## Page Templates & App Shell
The templates layer provides the foundational application shell and standardized page layouts to ensure a uniform experience across different modules.

* **Centralized Configuration**: A root provider manages global configurations, routing components, and user permissions. Navigation items are dynamically filtered based on user access rights, automatically hiding empty menu groups.
* **Agnostic Application Shell**: The main application shell provides a responsive layout with a header and collapsible sidebar. It remains completely agnostic to the routing framework by accepting URL paths and link components as generic properties.
* **Standardized Layouts**: Pre-built templates for lists, detail views, and dashboards ensure a predictable user interface and component arrangement across all system modules.
* **Contextual Loading & Errors**: The system utilizes specific skeleton loaders that match expected page layouts rather than generic spinners, drastically improving perceived performance. Error and fallback screens (e.g., 404, forbidden, server errors) use clear, user-friendly language rather than technical jargon.
* **Public Pages**: Public-facing landing and legal pages utilize distinct, typography-optimized layouts with constrained widths designed for high readability.

## UI & Testing Infrastructure
* **Framework-Independent UI**: Base UI components are stripped of hardcoded framework dependencies and rely entirely on CSS variables, enabling seamless theme switching without custom overrides.
* **Real-Environment Testing**: A dedicated playground environment runs components in a real browser context using the in-memory data provider. This approach effectively catches framework-specific boundary issues (like server-to-client component prop passing) that standard type-checking often misses.