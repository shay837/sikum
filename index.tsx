/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- ICONS --- //
const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        {/* A standard, reliable open-book icon to finally resolve the issue. */}
        <path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM11 18H6V6H11V18ZM18 18H13V6H18V18Z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V12.5L16.5 15.3L17.5 13.9L13 11.5V7Z" />
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"/>
    </svg>
);
const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L9.5 7L3 7.5L7.5 12L6 18L12 15L18 18L16.5 12L21 7.5L14.5 7L12 2Z" />
    </svg>
);
const StarIcon = ({ isFavorite }: { isFavorite: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`star-icon ${isFavorite ? 'favorite' : ''}`}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
    </svg>
);

// --- TYPES --- //
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  summary: string;
  readingTime: number;
  isRecommended: boolean;
  coverImage?: string;
}

// --- INITIAL DATA & LOCAL STORAGE --- //
const INITIAL_BOOKS: Book[] = [
  { id: '1', title: 'הנביא', author: 'ג׳ובראן חליל ג׳ובראן', genre: 'פילוסופיה', summary: 'ספר שירה ונבואה המדבר על אהבה, עבודה, שמחה וצער.', readingTime: 8, isRecommended: true, coverImage: 'https://placehold.co/100x100/2b3a67/ffffff?text=הנביא' },
  { id: '2', title: 'חשיבה מהירה ואיטית', author: 'דניאל כהנמן', genre: 'פסיכולוגיה', summary: 'בוחן את שתי מערכות החשיבה המניעות את האופן בו אנו חושבים.', readingTime: 15, isRecommended: true },
  { id: '3', title: 'קיצור תולדות האנושות', author: 'יובל נח הררי', genre: 'היסטוריה', summary: 'סקירה רחבה של ההיסטוריה האנושית מהאדם הקדמון ועד ימינו.', readingTime: 18, isRecommended: true, coverImage: 'https://placehold.co/100x100/2b3a67/ffffff?text=קיצור' },
  { id: '4', title: 'האומץ להיות לא אהוד', author: 'איצ׳ירו קישימי', genre: 'פסיכולוגיה', summary: 'דיאלוג בין פילוסוף לצעיר הבוחן את תורתו של אלפרד אדלר.', readingTime: 10, isRecommended: false },
  { id: '5', title: 'האלכימאי', author: 'פאולו קואלו', genre: 'ספרות', summary: 'רועה צאן במסע לגילוי אוצר, שמתגלה כמסע לגילוי עצמי.', readingTime: 7, isRecommended: false },
];

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { console.error(error); return initialValue; }
  });
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) { console.error(error); }
  };
  return [storedValue, setValue];
}


// --- ROUTING --- //
type Route = { page: 'home' } | { page: 'browse' } | { page: 'book'; bookId: string } | { page: 'form'; bookId?: string } | { page: 'admin' } | { page: 'favorites' } | { page: 'dashboard' };

function useHashRouter(): [Route, (route: Route) => void] {
    const [route, setInternalRoute] = useState<Route>(parseHash(window.location.hash));
    useEffect(() => {
        const handleHashChange = () => setInternalRoute(parseHash(window.location.hash));
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    const setRoute = (newRoute: Route) => { window.location.hash = formatHash(newRoute); };
    return [route, setRoute];
}

function parseHash(hash: string): Route {
    const path = hash.replace(/^#\/?/, '');
    const parts = path.split('/');

    switch (parts[0]) {
        case 'book':
            if (parts[1]) return { page: 'book', bookId: parts[1] };
            break; 
        case 'edit':
            if (parts[1]) return { page: 'form', bookId: parts[1] };
            break; 
        case 'new':
            return { page: 'form' };
        case 'browse':
            return { page: 'browse' };
        case 'admin':
            return { page: 'admin' };
        case 'favorites':
            return { page: 'favorites' };
        case 'dashboard':
            return { page: 'dashboard' };
        case 'home':
        case '':
            return { page: 'home' };
    }
    return { page: 'home' };
}

function formatHash(route: Route): string {
    if (route.page === 'book') return `book/${route.bookId}`;
    if (route.page === 'form') return route.bookId ? `edit/${route.bookId}` : 'new';
    if (route.page === 'browse') return 'browse';
    if (route.page === 'admin') return 'admin';
    if (route.page === 'favorites') return 'favorites';
    if (route.page === 'dashboard') return 'dashboard';
    return 'home';
}

// --- COMPONENTS --- //
function Header({ onNavigate, isAdmin, onLogout, route }: { onNavigate: (route: Route) => void; isAdmin: boolean; onLogout: () => void; route: Route; }) {
  const isHomePage = route.page === 'home';
  return (
    <header className={`app-header ${isHomePage ? 'transparent' : 'solid'}`}>
      <div className="header-content">
        <div className="logo" onClick={() => onNavigate({ page: 'home' })}>
          <h1 className="logo-text">סיכום</h1>
          <span className="logo-icon"><BookIcon /></span>
        </div>
        <nav className="main-nav">
          <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate({ page: 'home' }); }} className={`nav-link ${route.page === 'home' ? 'active' : ''}`}>דף הבית</a>
          <a href="#browse" onClick={(e) => { e.preventDefault(); onNavigate({ page: 'browse' }); }} className={`nav-link ${route.page === 'browse' ? 'active' : ''}`}>עיון בסיכומים</a>
          <a href="#favorites" onClick={(e) => { e.preventDefault(); onNavigate({ page: 'favorites' }); }} className={`nav-link ${route.page === 'favorites' ? 'active' : ''}`}>המועדפים שלי</a>
          {isAdmin && (
            <>
              <a href="#dashboard" onClick={(e) => { e.preventDefault(); onNavigate({ page: 'dashboard' }); }} className={`nav-link ${route.page === 'dashboard' ? 'active' : ''}`}>לוח בקרה</a>
              <div className="admin-controls">
                <button className="btn btn-primary" onClick={() => onNavigate({ page: 'form' })}>הוסף סיכום</button>
                <button className="btn btn-secondary" onClick={onLogout}>התנתק</button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function SummaryCard({ book, onSelect, onToggleFavorite, isFavorite }: { book: Book; onSelect: () => void; onToggleFavorite: (id: string) => void; isFavorite: boolean; }) {
  const getInitials = (title: string) => title.trim().charAt(0) || '?';
  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click when star is clicked
      onToggleFavorite(book.id);
  }
  return (
    <div className="summary-card" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
      <div className="card-header">
        {book.isRecommended && <div className="card-badge">מומלץ</div>}
        <button onClick={handleFavoriteClick} className="favorite-button" aria-label="הוסף למועדפים">
            <StarIcon isFavorite={isFavorite} />
        </button>
        {book.coverImage ? (
           <img src={book.coverImage} alt={`כריכת הספר ${book.title}`} className="card-cover-image" />
        ) : (
           <div className="card-initials">{getInitials(book.title)}</div>
        )}
        <div className="card-title-author">
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </div>
      </div>
      <div className="card-body">
         <div className="card-tags">
            <span className="card-tag">{book.genre}</span>
        </div>
        <div className="card-footer">
          <ClockIcon />
          <span>{book.readingTime} דקות קריאה</span>
        </div>
      </div>
    </div>
  );
}

function BookGrid({ books, onNavigate, onToggleFavorite, favoriteIds }: { books: Book[]; onNavigate: (route: Route) => void; onToggleFavorite: (id: string) => void; favoriteIds: string[]; }) {
    return (
        <div className="book-grid">
            {books.map((book) => (
                <SummaryCard key={book.id} book={book} onSelect={() => onNavigate({ page: 'book', bookId: book.id })} onToggleFavorite={onToggleFavorite} isFavorite={favoriteIds.includes(book.id)} />
            ))}
        </div>
    );
}

function HeroSection({ books, onSearch }: { books: Book[], onSearch: (query: string) => void }) {
    const [query, setQuery] = useState('');

    const totalBooks = books.length;
    const avgReadingTime = useMemo(() => {
        if (books.length === 0) return 0;
        const total = books.reduce((sum, book) => sum + book.readingTime, 0);
        return Math.round(total / books.length);
    }, [books]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    }

    return (
        <div className="hero-section">
            <div className="hero-icon-wrapper">
                <BookIcon />
            </div>
            <h1 className="hero-title">פשוט לקרוא חכם</h1>
            <p className="hero-subtitle">גלה את התובנות החשובות ביותר מספרים מובילים תוך 10 דקות קריאה בלבד</p>
            <form onSubmit={handleSearch}>
                <div className="search-container">
                    <input
                        type="search"
                        className="search-input"
                        placeholder="חפש ספר או מחבר..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button-icon-only">
                        <SearchIcon/>
                    </button>
                </div>
            </form>
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon"><CrownIcon /></div>
                    <span className="stat-label">סיכומים מקצועיים</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{avgReadingTime}</span>
                    <span className="stat-label">דקות קריאה ממוצע</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">+{totalBooks}</span>
                    <span className="stat-label">סיכומי ספרים זמינים</span>
                </div>
            </div>
        </div>
    );
}

function HomePage({ books, onNavigate, onSearch, onToggleFavorite, favoriteIds }: { books: Book[]; onNavigate: (route: Route) => void; onSearch: (query: string) => void; onToggleFavorite: (id: string) => void; favoriteIds: string[]; }) {
    const recommendedBooks = useMemo(() => books.filter(b => b.isRecommended).slice(0, 3), [books]);
    return (
        <>
            <HeroSection books={books} onSearch={onSearch} />
            <div className="homepage-content">
                <div className="container text-center">
                     <h2 className="section-title">סיכומים מומלצים</h2>
                     <p className="section-subtitle">הספרים המובילים שזוקקו עבורך לתובנות מפתח.</p>
                     <BookGrid books={recommendedBooks} onNavigate={onNavigate} onToggleFavorite={onToggleFavorite} favoriteIds={favoriteIds} />
                     <button className="btn btn-primary" style={{marginTop: '2rem'}} onClick={() => onNavigate({page: 'browse'})}>צפה בכל הסיכומים</button>
                </div>
            </div>
        </>
    );
}

function BrowsePage({ books, onNavigate, initialQuery, onQueryHandled, onToggleFavorite, favoriteIds }: { books: Book[]; onNavigate: (route: Route) => void; initialQuery?: string; onQueryHandled: () => void; onToggleFavorite: (id: string) => void; favoriteIds: string[]; }) {
    const [searchQuery, setSearchQuery] = useState(initialQuery || '');
    const [selectedGenre, setSelectedGenre] = useState('');

    useEffect(() => {
        if (initialQuery) {
            setSearchQuery(initialQuery);
            onQueryHandled();
        }
    }, [initialQuery, onQueryHandled]);
    
    const genres = useMemo(() => ['הכל', ...new Set(books.map(b => b.genre))], [books]);

    const filteredBooks = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return books.filter(book => {
            const matchesQuery = book.title.toLowerCase().includes(lowercasedQuery) || book.author.toLowerCase().includes(lowercasedQuery);
            const matchesGenre = !selectedGenre || selectedGenre === 'הכל' || book.genre === selectedGenre;
            return matchesQuery && matchesGenre;
        });
    }, [books, searchQuery, selectedGenre]);

    return (
        <div className="browse-page container">
            <h2 className="page-title">עיון בסיכומים</h2>
            <p className="section-subtitle">מצא את התובנה הבאה שלך. סנן לפי ז'אנר או חפש לפי כותרת.</p>
            <div className="filter-bar">
                 <input
                    type="search"
                    className="search-input"
                    placeholder="חפש ספר או מחבר..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select className="genre-filter" value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
            </div>
            <BookGrid books={filteredBooks} onNavigate={onNavigate} onToggleFavorite={onToggleFavorite} favoriteIds={favoriteIds} />
        </div>
    );
}

function FavoritesPage({ books, onNavigate, onToggleFavorite, favoriteIds }: { books: Book[]; onNavigate: (route: Route) => void; onToggleFavorite: (id: string) => void; favoriteIds: string[]; }) {
    const favoriteBooks = useMemo(() => books.filter(book => favoriteIds.includes(book.id)), [books, favoriteIds]);
    
    return (
        <div className="favorites-page container">
            <h2 className="page-title">המועדפים שלי</h2>
            {favoriteBooks.length > 0 ? (
                <>
                    <p className="section-subtitle text-center">אלו הסיכומים שסימנת לקריאה חוזרת. הם נשמרים רק בדפדפן הזה.</p>
                    <BookGrid books={favoriteBooks} onNavigate={onNavigate} onToggleFavorite={onToggleFavorite} favoriteIds={favoriteIds} />
                </>
            ) : (
                <p className="section-subtitle text-center">עדיין לא הוספת סיכומים למועדפים. חפש סיכומים ולחץ על הכוכב כדי להוסיף אותם לכאן.</p>
            )}
        </div>
    );
}

function DashboardPage({ books }: { books: Book[] }) {
    const totalBooks = books.length;
    
    const avgReadingTime = useMemo(() => {
        if (!totalBooks) return 0;
        return Math.round(books.reduce((sum, book) => sum + book.readingTime, 0) / totalBooks);
    }, [books, totalBooks]);
    
    const genreCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        for (const book of books) {
            counts[book.genre] = (counts[book.genre] || 0) + 1;
        }
        return Object.entries(counts).sort(([, a], [, b]) => b - a);
    }, [books]);
    
    const recommendedCount = useMemo(() => books.filter(b => b.isRecommended).length, [books]);

    return (
        <div className="dashboard-page container">
            <h2 className="page-title">לוח בקרה</h2>
            <p className="section-subtitle text-center">ניתוח נתונים על התוכן באתר.</p>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h4>סה"כ סיכומים</h4>
                    <p className="dashboard-stat">{totalBooks}</p>
                </div>
                <div className="dashboard-card">
                    <h4>זמן קריאה ממוצע</h4>
                    <p className="dashboard-stat">{avgReadingTime} דקות</p>
                </div>
                <div className="dashboard-card">
                    <h4>סיכומים מומלצים</h4>
                    <p className="dashboard-stat">{recommendedCount}</p>
                </div>
                <div className="dashboard-card large">
                    <h4>סיכומים לפי ז'אנר</h4>
                    <ul className="genre-list">
                        {genreCounts.map(([genre, count]) => (
                            <li key={genre}><span>{genre}</span><span>{count}</span></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function SummaryDetailView({ book, onNavigate, onDelete, isAdmin, onToggleFavorite, isFavorite }: { book: Book; onNavigate: (route: Route) => void; onDelete: (id: string) => void; isAdmin: boolean; onToggleFavorite: (id: string) => void; isFavorite: boolean; }) {
  const handleDelete = () => { if (window.confirm(`האם אתה בטוח שברצונך למחוק את "${book.title}"?`)) { onDelete(book.id); } };
  return (
    <article className="summary-detail-view container">
      {book.coverImage && <img src={book.coverImage} alt={`כריכת הספר ${book.title}`} className="summary-detail-cover" />}
      <div className="detail-header">
        <h2>{book.title}</h2>
        <button onClick={() => onToggleFavorite(book.id)} className="favorite-button large-star" aria-label="הוסף למועדפים">
          <StarIcon isFavorite={isFavorite} />
        </button>
      </div>
      <p className="author">מאת: {book.author}</p>
      <span className="genre">{book.genre}</span>
      <p className="summary-text">{book.summary}</p>
      {isAdmin && 
        <div className="actions">
          <button className="btn btn-primary" onClick={() => onNavigate({ page: 'form', bookId: book.id })}>עריכה</button>
          <button className="btn btn-danger" onClick={handleDelete}>מחיקה</button>
        </div>
      }
    </article>
  );
}

function SummaryForm({ book, onSave, onCancel }: { book?: Book; onSave: (bookToSave: Book) => void; onCancel: () => void; }) {
  const [formData, setFormData] = useState({
    title: book?.title ?? '', 
    author: book?.author ?? '', 
    genre: book?.genre ?? '', 
    summary: book?.summary ?? '', 
    readingTime: book?.readingTime ?? 10, 
    isRecommended: book?.isRecommended ?? false,
    coverImage: book?.coverImage ?? '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    setFormData((prev) => ({ ...prev, [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookToSave: Book = { 
        ...formData, 
        id: book?.id || new Date().toISOString(), 
        readingTime: Number(formData.readingTime),
        coverImage: formData.coverImage || undefined,
    };
    onSave(bookToSave);
  };
  return (
    <form className="summary-form container" onSubmit={handleSubmit}>
      <h2 className="page-title">{book ? 'עריכת סיכום' : 'סיכום חדש'}</h2>
      <div className="form-group"><label htmlFor="title">כותרת</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required /></div>
      <div className="form-group"><label htmlFor="author">מחבר</label><input type="text" id="author" name="author" value={formData.author} onChange={handleChange} required /></div>
      <div className="form-group"><label htmlFor="genre">ז'אנר</label><input type="text" id="genre" name="genre" value={formData.genre} onChange={handleChange} required /></div>
      <div className="form-group"><label htmlFor="coverImage">קישור לתמונת כריכה (URL)</label><input type="url" id="coverImage" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://example.com/image.jpg" /></div>
      <div className="form-group"><label htmlFor="readingTime">זמן קריאה (דקות)</label><input type="number" id="readingTime" name="readingTime" value={formData.readingTime} onChange={handleChange} required /></div>
      <div className="form-group"><label htmlFor="summary">סיכום</label><textarea id="summary" name="summary" value={formData.summary} onChange={handleChange} required rows={10} /></div>
      <div className="form-group form-group-checkbox"><label htmlFor="isRecommended">מומלץ?</label><input type="checkbox" id="isRecommended" name="isRecommended" checked={formData.isRecommended} onChange={handleChange} /></div>
      <div className="actions"><button type="submit" className="btn btn-primary">שמור</button><button type="button" className="btn btn-secondary" onClick={onCancel}>ביטול</button></div>
    </form>
  );
}

function AdminLoginPage({ onLogin }: { onLogin: (password: string) => boolean }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!onLogin(password)) {
            setError('סיסמה שגויה');
            setPassword('');
        }
    };
    return (
        <div className="admin-page container">
            <h2 className="page-title">כניסת מנהל</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="password">סיסמה</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
                <button type="submit" className="btn btn-primary" style={{width: '100%'}}>כניסה</button>
            </form>
        </div>
    );
}

// --- MAIN APP --- //
function App() {
  const [books, setBooks] = useLocalStorage<Book[]>('sikum-books-v3', INITIAL_BOOKS);
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>('sikum-favorites-v1', []);
  const [route, setRoute] = useHashRouter();
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('sikum-is-admin') === 'true');
  const [initialQuery, setInitialQuery] = useState('');

  const handleToggleFavorite = (bookId: string) => {
    setFavoriteIds(prev => prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]);
  }

  const handleSaveBook = (bookToSave: Book) => {
    setBooks(prev => {
        const exists = prev.some(b => b.id === bookToSave.id);
        return exists ? prev.map(b => b.id === bookToSave.id ? bookToSave : b) : [...prev, bookToSave];
    });
    setRoute({ page: 'browse' });
  };
  
  const handleDeleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    setFavoriteIds(prev => prev.filter(favId => favId !== id)); // Also remove from favorites
    setRoute({ page: 'browse' });
  };

  const handleLogin = (password: string) => {
      // IMPORTANT: For a real deployment, you should change this password!
      if (password === 'admin123') {
          sessionStorage.setItem('sikum-is-admin', 'true');
          setIsAdmin(true);
          setRoute({ page: 'home' });
          return true;
      }
      return false;
  }

  const handleLogout = () => {
      sessionStorage.removeItem('sikum-is-admin');
      setIsAdmin(false);
      setRoute({ page: 'home' });
  }
  
  const handleHomepageSearch = (query: string) => {
      setInitialQuery(query);
      setRoute({ page: 'browse' });
  }

  const onQueryHandled = useCallback(() => {
    setInitialQuery('');
  }, []);


  const renderContent = () => {
    if (route.page === 'admin') {
      return <AdminLoginPage onLogin={handleLogin} />;
    }
    if (route.page === 'dashboard') {
        if (!isAdmin) return <p className="container text-center">אין לך הרשאה לגשת לדף זה.</p>;
        return <DashboardPage books={books} />;
    }
    if (route.page === 'favorites') {
        return <FavoritesPage books={books} onNavigate={setRoute} onToggleFavorite={handleToggleFavorite} favoriteIds={favoriteIds} />;
    }
    if (route.page === 'form') {
      if (!isAdmin) return <p className="container text-center">אין לך הרשאה לגשת לדף זה.</p>;
      const bookToEdit = route.bookId ? books.find(b => b.id === route.bookId) : undefined;
      return <SummaryForm book={bookToEdit} onSave={handleSaveBook} onCancel={() => setRoute({ page: 'browse' })} />;
    }
    if (route.page === 'book') {
      const book = books.find(b => b.id === route.bookId);
      return book ? <SummaryDetailView book={book} onNavigate={setRoute} onDelete={handleDeleteBook} isAdmin={isAdmin} onToggleFavorite={handleToggleFavorite} isFavorite={favoriteIds.includes(book.id)} /> : <p className="container text-center">ספר לא נמצא.</p>;
    }
    if (route.page === 'browse') {
        return <BrowsePage books={books} onNavigate={setRoute} initialQuery={initialQuery} onQueryHandled={onQueryHandled} onToggleFavorite={handleToggleFavorite} favoriteIds={favoriteIds} />;
    }
    return <HomePage books={books} onNavigate={setRoute} onSearch={handleHomepageSearch} onToggleFavorite={handleToggleFavorite} favoriteIds={favoriteIds} />;
  };

  return (
    <>
      <Header onNavigate={setRoute} isAdmin={isAdmin} onLogout={handleLogout} route={route} />
      <main>
        {renderContent()}
      </main>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);