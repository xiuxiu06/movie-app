# My Movie App 🎬

A modern, responsive movie discovery web application built with React and powered by TMDB API. Features infinite scroll, real-time trending system, and stunning visual effects.

![Movie App Demo](hero.png)

## ✨ Features

- **🔍 Smart Search**: Real-time movie search with debounced API calls
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **♾️ Infinite Scroll**: Seamless pagination for endless movie browsing
- **📈 Trending System**: Dynamic ranking based on user search patterns
- **🎨 Visual Effects**: 
  - Animated gradient background
  - Floating hero image animation
  - Glassmorphism movie cards
  - Custom animated SVG silk strip
  - Custom glowing cursor
- **⚡ Performance Optimized**: Debounced search, efficient state management

## 🛠️ Tech Stack

### Frontend
- **React** - Component-based UI library
- **JavaScript ES6+** - Modern JavaScript features
- **Tailwind CSS** - Utility-first CSS framework
- **GSAP** - Professional animation library
- **Vite** - Fast build tool and development server

### Backend & Database
- **Appwrite** - Backend-as-a-Service platform
- **TMDB API** - Movie database and information
- **REST API** - RESTful API integration

### Animation & Effects
- **GSAP ScrollTrigger** - Scroll-based animations
- **CSS Keyframes** - Custom animations
- **SVG Animations** - Interactive graphics

## 🎨 Key Features Breakdown

### Search & Discovery
- Debounced search input (500ms delay) to prevent excessive API calls
- Real-time movie search with comprehensive error handling
- Loading states and smooth user feedback

### Trending System
- **Dynamic Tracking**: Uses Appwrite database to track user search patterns
- **Smart Algorithm**: Automatically updates search counts and rankings
- **Data Persistence**: Stores movie metadata including poster URLs and TMDB IDs
- **Top 10 Display**: Shows most searched movies in descending order
- **Real-time Updates**: Trending list updates based on user interactions

### Database Operations
```javascript
// Track search patterns
updateSearchCount(searchTerm, movie)
// Retrieve trending movies
getTrendingMovies()
```

### Visual Effects & Animations
- **Hero Animation**: Floating effect using GSAP for smooth motion
- **Background**: Animated gradient with custom color transitions
- **Movie Cards**: Glassmorphism design with backdrop filters and transparency
- **SVG Animation**: Custom silk strip that draws progressively on scroll
- **Custom Cursor**: Glowing cursor with smooth mouse tracking

### Performance Optimizations
- Infinite scroll pagination for seamless browsing experience
- Efficient React state management with minimal re-renders
- Optimized GSAP animations running at 60fps
- Smart batch loading for movie cards

## 🏗️ Database Schema

The Appwrite database stores trending search data with the following structure:

```javascript
{
  searchTerm: "string",     // User's search query
  count: "integer",         // Number of times searched
  movie_id: "integer",      // TMDB movie ID
  poster_url: "string",     // Full poster image URL
  $id: "unique_id",         // Appwrite document ID
  $createdAt: "timestamp",  // Auto-generated timestamp
  $updatedAt: "timestamp"   // Auto-generated timestamp
}
```

## 📱 Demo

🔗 **Live Demo**: [https://yourusername.github.io/my-movie-app](https://yourusername.github.io/my-movie-app)

## 🏗️ Architecture

The application follows a modern React architecture with:
- Component-based design for reusability
- Custom hooks for state management
- RESTful API integration with error handling
- Real-time database operations with Appwrite
- Responsive design with mobile-first approach

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the comprehensive movie database
- [Appwrite](https://appwrite.io/) for the backend services
- [GSAP](https://greensock.com/) for the animation library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

**Made with ❤️ by Tam**

---

## React + Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your