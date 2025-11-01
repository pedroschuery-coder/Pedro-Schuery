# AI Rules for Sales Commission Tracker Application

This document outlines the technical stack and specific library usage guidelines for the Sales Commission Tracker application. These rules are intended to ensure consistency, maintainability, and adherence to best practices.

## Tech Stack Description

*   **React**: The application is built using React for its component-based architecture, enabling a modular and efficient user interface.
*   **TypeScript**: All application code is written in TypeScript, providing static type checking to enhance code quality, readability, and reduce runtime errors.
*   **Tailwind CSS**: Styling is managed exclusively with Tailwind CSS, a utility-first CSS framework, for rapid and consistent UI development.
*   **Vite**: The project uses Vite as its build tool, offering a fast development server and optimized build process.
*   **React Router**: For navigation within the single-page application, React Router is used to manage routes and views.
*   **shadcn/ui**: The application leverages components inspired by or directly from `shadcn/ui` for a consistent and modern user interface.
*   **Lucide React**: Icons throughout the application are provided by the `lucide-react` library, offering a wide range of customizable vector icons.
*   **Supabase**: Supabase is integrated for backend services, including user authentication (Google OAuth) and potentially data storage.
*   **Local Storage**: Client-side data persistence for user-specific sales data and application settings is handled using the browser's `localStorage` API via a custom hook.

## Library Usage Rules

*   **UI Components**:
    *   **General UI**: Prioritize using `shadcn/ui` components (or custom components built in the `src/components/ui` directory following `shadcn/ui` principles) for all user interface elements.
    *   **Custom Components**: If a specific `shadcn/ui` component is not available or requires significant modification, create a new, small, and focused component in `src/components/` or `src/components/ui/`.
*   **Styling**:
    *   **CSS Framework**: Always use **Tailwind CSS** for all styling. Avoid writing custom CSS files or inline styles unless absolutely necessary for dynamic, calculated styles.
    *   **Responsiveness**: All designs must be responsive and adapt well to different screen sizes using Tailwind's responsive utility classes.
*   **Icons**:
    *   **Icon Library**: Use **`lucide-react`** for all icons. Import icons directly from `lucide-react` and apply styling via Tailwind CSS classes.
*   **State Management**:
    *   **Local State**: For component-specific state, use React's `useState` and `useReducer` hooks.
    *   **Derived State/Memoization**: Use `useMemo` and `useCallback` for optimizing performance by memoizing expensive calculations or functions.
    *   **Persistent Client-Side State**: For data that needs to persist across sessions (e.g., user sales data, store goals), use the `useLocalStorage` hook.
*   **Routing**:
    *   **Navigation**: Use **React Router** for all application navigation. Define routes within `src/App.tsx`.
*   **Authentication & Backend**:
    *   **Auth**: **Supabase** is the designated provider for user authentication. Use the `@supabase/auth-ui-react` library for authentication UI and the `supabase-js` client for direct interactions.
    *   **API Keys/Secrets**: Never hardcode API keys or sensitive information directly into the client-side code. Use environment variables.
*   **Date & Currency Formatting**:
    *   **Formatters**: Utilize the utility functions provided in `src/utils/formatters.ts` (e.g., `formatCurrencyBRL`) for consistent data presentation.
    *   **Date Objects**: Use standard JavaScript `Date` objects for date manipulation and comparison.
*   **Error Handling**:
    *   **Client-Side Errors**: Do not implement `try/catch` blocks for general errors unless specifically requested. Allow errors to bubble up for centralized handling and debugging.
    *   **User Feedback**: Use toast notifications (if implemented) to inform users about important events or non-critical errors.