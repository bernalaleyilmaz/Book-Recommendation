import React, {useState, useEffect} from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {useNavigate} from "react-router-dom";

function Home(){
    const [searchParams, setSearchParams] = useSearchParams(); //bu bir url okuyucu saygayı yenilesem bile bizi en başa atmicak
    const navigate= useNavigate();
    const currentUserId = parseInt(localStorage.getItem("userId")) || 1;
    const currentUserName = localStorage.getItem("username") || "Berna";
    const[isMenuOpen, setIsMenuOpen] = useState(false); //menü açık mı kapalı diye bakıyoruz
    const[isSortOpen, setIsSortOpen] = useState(false);
    const[activeSort, setActiveSort] = useState("Alphabetical (A-Z)");
    const[activeFilters, setActiveFilters] = useState([]);
    // filtreyi başlangıçta boş liste yaptım
    const[isFilterOpen, setIsFilterOpen] = useState(false); // filtre başta kapalı
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1); //artık sayfa numarası urlden okunuyor
    const[totalPage,setTotalPage]=useState(1);
    const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
    const [bookPublishers, setBookPublishers] = useState([]);

    const [activeFilterCategory, setActiveFilterCategory] = useState(null); // Hangi alt menüdeyiz?
    const [yearValue, setYearValue] = useState(2000); // Touch bar yılı
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const[books, setBooks]= useState([]);
    const [bookAuthors, setBookAuthors] = useState([]);
    const [authorPage, setAuthorPage] = useState(1); // Yazar listesinin sayfası
    const [hasMoreAuthors, setHasMoreAuthors] = useState(true);

    const [isStarMenuOpen, setIsStarMenuOpen] = useState(false); // Yıldız menüsü açık mı?
    const [starTab, setStarTab] = useState('ratings'); // Hangi sekmedeyiz? ('ratings' veya 'comments')
    const [isExpandedRatingsOpen, setIsExpandedRatingsOpen] = useState(false); // Tam ekran menüsü açık mı?

    const [userName, setUserName] = useState(currentUserName);
    const[userRatings, setUserRatings]= useState([]);
    const [userComments, setUserComments] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Ayarlar menüsü açık mı?

    // Ayarlar Menüsü
    const [settingsAction, setSettingsAction] = useState(null); // 'username', 'password', 'delete' veya null
    const [settingsInput1, setSettingsInput1] = useState(""); // Yeni ad veya mevcut şifre için
    const [settingsInput2, setSettingsInput2] = useState(""); // Yeni şifre için

    const [hoveredIndex, setHoveredIndex] = useState(null); // hangi kitabın üstündeyiz
    const [isModalOpen, setIsModalOpen] = useState(false); // puan penceresi açık mı
    const [selectedBook, setSelectedBook] = useState(null); // hangi kitaba tıklandı
    const [comment, setComment] = useState("");
    const [score, setScore] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // kitapların ortlamasını güncellemek için
    const [isLoading, setIsLoading] = useState(true); // Başlangıçta yükleniyor kabul ediyoruz
    // ÖNERİ SİSTEMİ HAFIZALARI
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false); // Öneri paneli açık mı?
    const [favoriteBookInput, setFavoriteBookInput] = useState(""); // Kullanıcının girdiği favori kitap
    const [suggestedBooks, setSuggestedBooks] = useState([]); // Yapay zekadan gelen kitaplar
    const [isSuggesting, setIsSuggesting] = useState(false); // Yapay zeka düşünürken loading animasyonu
    const [hoveredSuggestionIndex, setHoveredSuggestionIndex] = useState(null);
    // TOPLULUK YORUMLARI
    const [bookReviews, setBookReviews] = useState([]); // Diğer kullanıcıların yorumları
    const [showReviewInput, setShowReviewInput] = useState(false); // Yorum yazma alanı açık mı?
    const [isReviewsLoading, setIsReviewsLoading] = useState(false); // Yorumlar yüklenirken
    const [isDarkMode, setIsDarkMode] = useState(() =>{ return localStorage.getItem('theme') === 'dark'});

    // BİLDİRİM  STATE'İ
    const [toast, setToast] = useState(null);
    const showToast = (message, type, callback) => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
            if (callback) callback();
        }, 2000); // 2 saniye ekranda kalır
    };
    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        document.body.style.backgroundColor = isDarkMode ? '#121612' : '#F3EFE9';
        document.body.style.color = isDarkMode ? '#E3D8C8' : '#323D2E';
        document.body.style.transition = 'background-color 0.3s ease';
    }, [isDarkMode]);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark ' : 'light');
        setIsSettingsOpen(false); //menüyü kapat
    };
    const theme = {
        bgMain: isDarkMode ? '#121612' : '#F3EFE9',
        bgCard: isDarkMode ? '#1E241E' : '#FCFAF8',
        bgMenu: isDarkMode ? '#1A201A' : '#F3EFE9',
        textMain: isDarkMode ? '#E3D8C8' : '#323D2E',
        textSecondary: isDarkMode ? '#A8B3A1' : '#5D4037',
        textMuted: isDarkMode ? '#75806D' : '#90A08C',
        borderLight: isDarkMode ? 'rgba(227, 216, 200, 0.1)' : 'rgba(50, 61, 46, 0.1)',
        borderMedium: isDarkMode ? 'rgba(227, 216, 200, 0.2)' : 'rgba(50, 61, 46, 0.2)',
        primary: isDarkMode ? '#5B7054' : '#404F3B',
        accent: '#C28F79',
        toastBg: isDarkMode ? '#2A3326' : '#404F3B',
        overlay: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
        drawerBg: isDarkMode ? '#121612' : '#404F3B',
        topBarBg: isDarkMode ? 'rgba(18, 22, 18, 0.95)' : 'rgba(144, 160, 140, 0.95)'
    };

    useEffect(() => {
        const fetchAuthors = async () => {
            if (!hasMoreAuthors) return; // Yazarlar bittiyse boşuna arka uca gitme

            try {
                const response = await fetch(`http://localhost:8000/authors?page=${authorPage}&limit=30`);
                const data = await response.json();

                if (data.authors.length === 0) {
                    setHasMoreAuthors(false); // Arka uçtan boş liste gelirse "Yazarlar bitti" de
                } else {
                    // Gelen yeni yazarları eski listenin ÜZERİNE EKLE
                    setBookAuthors(prev => {
                        if (authorPage === 1) return data.authors;
                        return [...prev, ...data.authors];
                    });
                }
            } catch (error) {
                console.error("authors cannot exract:", error);
            }
        };

        fetchAuthors();
    }, [authorPage]); //  authorPage her değiştiğinde kurye yola çıkar


    // Yayınevlerini çeken kurye
    useEffect(() => {
        const fetchPublishers = async () => {
            try {
                const response = await fetch(`http://localhost:8000/publishers`);
                const data = await response.json();
                setBookPublishers(data.publishers || []);
            } catch (error) {
                console.error("publisher could not be retrieved:", error);
            }
        };

        fetchPublishers();
    }, []); // Sadece sayfa ilk açıldığında 1 kere çalışır


    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true); // Yükleme animasyonunu başlat

            // TEST İÇİN: 1 Saniye bekletme (çalıştığını gördükten sonra bu satırı silebilirsin)
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                console.log("1. TEST  =>", `"${activeSort}"`);
                let backendSort = "";
                let queryParams= ""; // filtreleride dizicez

                if (activeSort === "Alphabetical (A-Z)") {
                    backendSort = "&sort_by=alphabetical";
                } else if (activeSort === "Highest Rated") {
                    backendSort = "&sort_by=popular";
                }else if (activeSort=== "Lowest Rated"){
                    backendSort = "run &sort_by=lowest";
                }else if(activeSort=== "Newest"){
                    backendSort ="&sort_by=newest";
                }else if (activeSort==="Oldest"){
                    backendSort="&sort_by=oldest";
                }

                activeFilters.forEach(filter=>{
                    if(filter.startsWith("Year:")){
                        const minYear=parseInt(filter.replace(/\D/g,""));
                        queryParams+= `&min_year=${minYear}`;
                    }
                    if (filter.startsWith("Author:")){
                        const authorName =filter.replace("Author:", "");
                        queryParams+= `&author=${authorName}`;
                    }
                    if (filter.startsWith("Publisher:")) {
                       const publisherName = filter.replace("Publisher:", "");
                       queryParams += `&publisher=${encodeURIComponent(publisherName.trim())}`;
                     }
                });
                if(searchQuery){
                    // trim() kenarlardaki gereksiz boşlukları siler
                    // encodeURIComponent aradaki boşlukları %20 yapar
                    queryParams += `&search=${encodeURIComponent(searchQuery.trim())}`;
                }
               const finalUrl = `http://localhost:8000/books?page=${currentPage}&limit=24${backendSort}${queryParams}`;

                //  Kuryenin arka uca gittiği tam adresi görürüz
                console.log("2. TEST (which URL) =>", finalUrl);
                //  Hazırladığımız backendSort parametresini URL'nin EN SONUNA ekledik!
                const response = await fetch(finalUrl);

                const data = await response.json();
                console.log("Backend'den gelen veri:", data);
                setBooks(data.books || []);

                const pages = Math.ceil((data.total || 0) / 24);
                setTotalPage(pages || 1);

                window.scrollTo({top: 0, behavior: 'smooth'});
                console.log("books from backend", data);

            } catch(error) {
                console.error("data could not retrieved", error);
                setBooks([]);
            } finally {
                setIsLoading(false); //  Hata olsa da olmasa da yükleniyor ekranını kapat
            }
        };



        fetchBooks();
    }, [currentPage,  activeFilters, activeSort,searchQuery, refreshTrigger]); //Bu sayede refreshTrigger her değiştiğinde, kurye otomatik olarak arka uca gidip kitapların en güncel ortalama puanlarını alıp gelecek

    // ÖNERİ PANELİ AÇILDIĞINDA OTOMATİK ÇALIŞAN MOTOR
    useEffect(() => {
        if (isSuggestionsOpen) {
            const fetchSuggestions = async () => {
                setIsSuggesting(true); // Yükleniyor animasyonunu aç
                try {
                    // Arama kutusu boşken direkt kullanıcının ID'si ile istek atıyoruz
                    const url = `http://localhost:8000/suggestions?user_id=${currentUserId}`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.suggestions && data.suggestions.length > 0) {
                        setSuggestedBooks(data.suggestions);
                    } else {
                        setSuggestedBooks([]); // Eğer 4-5 yıldızlı kitap yoksa listeyi boşalt
                        console.log("Backend Mesajı:", data.message);
                    }
                } catch (error) {
                    console.error("Yapay Zeka Bağlantı Hatası:", error);
                } finally {
                    setIsSuggesting(false);
                }
            };

            // Eğer favori kitap arama çubuğu boşsa otomatik tetikle
            if (!favoriteBookInput) {
                fetchSuggestions();
            }
        }
    }, [isSuggestionsOpen, currentUserId, favoriteBookInput]);

    // MOTOR 1: Sıralama Seçme
    const handleSortSelect = (sortType) => {
        setActiveSort(sortType);
        setIsSortOpen(false);
    };

    // MOTOR 2: Filtre Ekleme (Aynı filtre 2 kez eklenmesin diye kontrol ediyoruz)
    const handleAddFilter = (newFilter) => {
        if (!activeFilters.includes(newFilter)) {
            setActiveFilters([...activeFilters, newFilter]);
            setCurrentPage(1); //Filtre eklenince bizi ilk sayfaya ışınlar!
        }
        setIsFilterOpen(false); // Ekranda kalabalık yapmasın diye menüyü kapat
        setActiveFilterCategory(null); // Alt menüyü sıfırla
    };

    // MOTOR 3: Filtre Silme (Çarpıya basınca çalışır)
    const removeFilter = (filterToRemove) => {
        setActiveFilters(activeFilters.filter(f => f !== filterToRemove));
    };

    // İsmin ilk iki harfini alıp büyük harfe çeviriyoruz
    const avatarLetters = userName && userName.length >= 2
        ? userName.substring(0, 2).toUpperCase()
        : "US";

    // Arama kelimesi veya sayfa değiştiğinde URL'yi anında güncelleyen motor
    useEffect(() => {
        const params = {};

        if (searchQuery) {
            params.search = searchQuery;
        }

        if (currentPage > 1) {
            params.page = currentPage;
        }

        setSearchParams(params);
    }, [searchQuery, currentPage, setSearchParams]);

    // Giriş yapan kullanıcının verilerini API'den çeken kurye
    // Giriş yapan kullanıcının verilerini API'den çeken kurye
    useEffect(() => {
        const fetchUserData = async () => {
            // DİKKAT: Eskiden burada olan "if (!isStarMenuOpen...) return;" kilit satırını sildik!
            // Artık kurye, menünün açılmasını beklemeden ana sayfa yüklenir yüklenmez verileri çekecek.
            try {
                const response = await fetch(`http://localhost:8000/my-ratings?user_id=${currentUserId}` );
                const data = await response.json();
                const allData = data.ratings || [];

                setUserRatings(allData.filter(item => item.score > 0));
                setUserComments(allData.filter(item => item.comments && item.comments.trim() !== ""));
            } catch (error) {
                console.error("user data cannot be retrieved ", error);
            }
        };
        fetchUserData();
    }, [currentUserId, refreshTrigger]); // Menüye değil, sadece yeni bir oy verildiğinde (refreshTrigger) çalışır // Menüler açıldığında veriyi tazele

    // AYARLAR: Backend'e veri gönderen motor
    const handleSettingsSubmit = async () => {
        try {
            if (settingsAction === 'username') {
                const response = await fetch(`http://localhost:8000/users/${currentUserId}/username`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ new_username: settingsInput1 }) //javascript nesnsini json formatında metne çevirir
                });
                if (response.ok) {
                    setUserName(settingsInput1); // React ekranındaki ismi hemen güncelle
                    showToast("Username updated successfuly!", "success");
                } else {
                    showToast("Error: You cannot get this username.", "error");
                }
            }
            else if (settingsAction === 'password') {
                const response = await fetch(`http://localhost:8000/users/${currentUserId}/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ current_password: settingsInput1, new_password: settingsInput2 })
                });
                if (response.ok) {
                    showToast("Your password updated successfuly!", "success");
                } else {
                    showToast("Error: You entered your current password incorrectly.", "error");
                }
            }
            else if (settingsAction === 'delete') {
                const response = await fetch(`http://localhost:8000/users/${currentUserId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    showToast("Your account and data deleted permanently. 🗑️", "success", () => {
                        localStorage.removeItem('userId');
                        localStorage.removeItem('username');
                        navigate('/');
                    });
                    return;// Kodu burada kes ki sayfayı yönlendirirken aşağıdaki işlemler çalışmasın
                }else{
                    showToast("Error: Account could not be deleted", "error")
                }
            }

            setSettingsAction(null);
            setSettingsInput1("");
            setSettingsInput2("");

        } catch (error) {
            console.error("Ayarlar güncellenirken hata oluştu:", error);
            showToast("An unexpected error occurred.", "error");
        }
    };

    // ÇIKIŞ YAPMA MOTORU
    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        showToast("Logged out successfully. See you later📖", "success", () =>{
            navigate('/');
        });
    };

    // KULLANICI PUAN VEYA YORUM SİLME MOTORU (GÜNCELLENDİ)
    const handleSpecificDelete = async (isbn, type) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this ${type}?`);
        if (!confirmDelete) return;

        try {
            if (type === 'rating') {
                const response = await fetch(`http://localhost:8000/rate?user_id=${currentUserId}&book_isbn=${isbn}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setUserRatings(prev => prev.filter(item => item.isbn !== isbn));
                    setUserComments(prev => prev.filter(item => item.isbn !== isbn));
                    showToast("Rating deleted successfully!", "success");
                    setRefreshTrigger(prev => prev + 1);
                } else {
                    showToast("Hata: İşlem başarısız oldu.", "error");
                }

            } else if (type === 'comment') {
                const existingItem = [...userRatings, ...userComments].find(item => item.isbn === isbn);
                const currentScore = existingItem ? existingItem.score : 5;

                const response = await fetch(`http://localhost:8000/rate?user_id=${currentUserId}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        book_isbn: isbn,
                        score: currentScore,
                        comments: ""
                    })
                });

                if (response.ok) {
                    setUserComments(prev => prev.filter(item => item.isbn !== isbn));
                    showToast("Comment deleted successfully!", "success");
                } else {
                    showToast("Hata: İşlem başarısız oldu.", "error");
                }
            }
        } catch (error) {
            console.error("Silme hatası:", error);
            showToast("Sunucuya bağlanılamadı.", "error");
        }
    };

    // KULLANICI PUAN/YORUM GÜNCELLEME MOTORU (Eski verilerle pencereyi açar)
    const handleEditAction = (item) => {
        setSelectedBook(item);
        setScore(item.score);
        setHoveredStar(item.score);
        setComment(item.comments || "");
        setIsExpandedRatingsOpen(false);
        setIsModalOpen(true);
    };
    const styles = getStyles(theme);

    return (
        <>
            <div style={styles.container}>
                {/* EĞER TOAST STATE'İ DOLUYSA BU KUTUYU EKRANDA GÖSTER */}
                {toast && (
                    <div style={{
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        // Senin temandaki Orman Yeşili ve Kırmızı tonları
                        backgroundColor: toast.type === 'success' ? '#404F3B' : '#D32F2F',
                        // Senin temandaki Krem/Beyaz yazı rengi
                        color: '#F3EFE9',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        // Senin temandaki gölgelendirmeler
                        boxShadow: '0 4px 15px rgba(50, 61, 46, 0.4)',
                        // Başarılıysa Altın rengi ince bir çerçeve
                        border: toast.type === 'success' ? '1px solid #C28F79' : '1px solid rgba(255,255,255,0.3)',
                        zIndex: 999999999,
                        fontWeight: 'bold',
                        // Senin temandaki o zarif font
                        fontFamily: "'Playfair Display', serif",
                        animation: 'fadeIn 0.3s ease-in-out',
                        letterSpacing: '1px'
                    }}>

                        {toast.message}
                    </div>
                )}
                <div style={styles.topBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button style={styles.sideBtn} onClick={() => setIsMenuOpen(true)}>☰</button>
                        <div style={styles.brand}><div style={styles.spine}></div>BOOK HEAVEN</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                        <input type="text" placeholder=" Search Book, author or genre ..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={{ ...styles.searchInput, width: '100%', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }} onKeyDown={(e) => { if (e.key === 'Enter') { setSearchQuery(inputValue); setCurrentPage(1); } }} />
                        <button style={{ padding: '12px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#323D2E', marginLeft: '-45px' }} onClick={() => { setSearchQuery(inputValue); setCurrentPage(1); }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </div>
                    <div style={styles.profileArea}>
                        <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                            <span style={{ marginRight: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setIsStarMenuOpen(!isStarMenuOpen)}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </span>
                            {isStarMenuOpen && (
                                <div style={styles.starMenu} onClick={(e) => e.stopPropagation()}>
                                    <div style={styles.tabContainer}>
                                        <button style={starTab === 'ratings' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setStarTab('ratings')}>MyRatings</button>
                                        <button style={starTab === 'comments' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setStarTab('comments')}>MyComments</button>
                                    </div>
                                    <div style={{...styles.starContent, position: 'relative', paddingBottom: '40px'}}>
                                        {starTab === 'ratings' ? (userRatings.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                                                {userRatings.map((item, index) => (
                                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(50, 61, 46, 0.1)', paddingBottom: '8px' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#323D2E', textAlign: 'left', fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: '10px' }}>{item.title}</span>
                                                        <span style={{ color: '#C28F79', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>{item.score} ★</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p>You haven't rate for any books yet</p>) : (userComments.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', textAlign: 'left' }}>
                                                {userComments.map((item, index) => (
                                                    <div key={index} style={{ borderBottom: '1px solid rgba(50, 61, 46, 0.1)', paddingBottom: '8px' }}>
                                                        <div style={{ fontWeight: 'bold', color: '#323D2E', fontSize: '12px', marginBottom: '4px' }}>{item.title}</div>
                                                        <div style={{ fontSize: '11px', color: '#5D4037', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '4px' }}>"{item.comments}"</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p>You haven't comment for any books yet.</p>)}
                                        {(userRatings.length > 0 || userComments.length > 0) && (
                                            <div onClick={() => { setIsExpandedRatingsOpen(true); setIsStarMenuOpen(false); }} style={{ position: 'absolute', bottom: '8px', right: '12px', cursor: 'pointer', color: '#C28F79', padding: '5px' }} title="Show Full Screen">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <span style={{marginRight: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center'}} onClick={() => { setIsSettingsOpen(!isSettingsOpen); setIsStarMenuOpen(false); }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1h.09a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </span>
                        {isSettingsOpen && (
                            <div style={styles.settingsMenu} onClick={(e) => e.stopPropagation()}>
                                <div style={styles.settingsHeader}>ACCOUNT SETTİNGS</div>
                                <div style={styles.settingsItem} onClick={() => { setSettingsAction('username'); setIsSettingsOpen(false); }}>Change username</div>
                                <div style={styles.settingsItem} onClick={() => { setSettingsAction('password'); setIsSettingsOpen(false); }}>Change password</div>
                                <div style={styles.settingsHeader}>PREFERENCES</div>
                                <div style={{...styles.settingsItem, color: '#C28F79', fontWeight: 'bold'}} onClick={toggleTheme}>
                                    {isDarkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
                                </div>
                                <div style={{...styles.settingsItem, color: '#404F3B', fontWeight: 'bold'}} onClick={handleLogout}>Log Out 🚪</div>
                                <hr style={{ border: '0', borderTop: '1px solid rgba(50, 61, 46, 0.1)', margin: 0 }} />
                                <div style={{...styles.settingsItem, color: '#D32F2F', fontWeight: 'bold'}} onClick={() => { setSettingsAction('delete'); setIsSettingsOpen(false); }}>Delete Account</div>
                            </div>
                        )}
                        <span style={styles.avatar}>{avatarLetters}</span>
                    </div>
                </div>
                <div style={styles.toolbar}>
                    <span style={styles.groupLabel}>SORT BY</span>
                    <div style={{position: 'relative'}}>
                        <div style ={styles.dropdownBtn} onClick={() => {setIsSortOpen(!isSortOpen);
                            setIsFilterOpen(false); }}>{activeSort}<span
                            style={{marginLeft: '8px', fontSize: '10px'}}>▼</span></div>
                        {isSortOpen && (
                            <div style={styles.dropdownMenu}>
                                <div style={styles.dropdownItem} onClick={() => handleSortSelect("Alphabetical (A-Z)")}>Alphabetical (A-Z)</div>
                                <div style={styles.dropdownItem} onClick={() => handleSortSelect("Highest Rated")}>Highest Rated</div>
                                <div style={styles.dropdownItem} onClick={() => handleSortSelect("Lowest Rated")}>Lowest Rated</div>
                                <div style={styles.dropdownItem} onClick={() => handleSortSelect("Newest")}>Newest</div>
                                <div style={styles.dropdownItem} onClick={() => handleSortSelect("Oldest")}>Oldest</div>
                            </div>
                        )}
                    </div>
                    <span style={{ ...styles.groupLabel, marginLeft: '20px' }}>FILTER</span>

                    <div style={{position: 'relative'}}>
                        <div style={{ ...styles.dropdownBtn, border: '1px solid rgba(50, 61, 46, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
                             onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); setActiveFilterCategory(null); }}>≡ Select Filters</div>
                        {isFilterOpen && (
                            <div style={styles.filterMenu}>
                                {!activeFilterCategory ? (
                                    <>
                                        <div style={styles.dropdownItem} onClick={() => setActiveFilterCategory('Year')}>Year <span style={{float: 'right'}}>▶</span></div>
                                        <div style={styles.dropdownItem} onClick={() => setActiveFilterCategory('Publisher')}>Publisher <span style={{float: 'right'}}>▶</span></div>
                                    </>
                                ) : (
                                    <>
                                        <div style={styles.backBtn} onClick={() => setActiveFilterCategory(null)}>◀ Back</div>
                                        {activeFilterCategory === 'Year' && (
                                            <div style={{padding: '15px'}}>
                                                <p style={{margin: '0 0 10px 0', fontSize: '13px', color: '#323D2E'}}>Published after: <strong>{yearValue}</strong></p>
                                                <input type="range" min="1800" max="2026" value={yearValue} onChange={(e) => setYearValue(e.target.value)} style={{width: '100%', cursor: 'pointer'}} />
                                                <button style={styles.applyBtn} onClick={() => handleAddFilter(`Year: ${yearValue}+`)}>Apply</button>
                                            </div>
                                        )}
                                        {activeFilterCategory === 'Publisher' && (<div style={{maxHeight: '250px', overflowY:'auto'}}>
                                            {bookPublishers.map((pub,index)=>(
                                                <div key={index} style={styles.dropdownItem}
                                                     onClick={()=>handleAddFilter(`Publisher: ${pub}`)}>{pub}</div>))}</div>)}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {activeFilters.map(filter => (<div key={filter} style={styles.chip}>{filter}<span style={{cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold'}} onClick={() => removeFilter(filter)}>✕</span></div>))}
                    {/* ÖNERİ SİSTEMİ BUTONU */}
                    <div style={{ marginLeft: 'auto' }}>
                        <button
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#C28F79',
                                color: '#F3EFE9',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontFamily: "sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 10px rgba(194, 143, 121, 0.3)',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={ async () => {
                                setIsSuggestionsOpen(true);
                                setFavoriteBookInput(""); // Yeni açılışta arama kutusunu sıfırla
                            }}
                            >
                            <span style={{ fontSize: '16px' }}>✨</span> Suggestions for You
                        </button>
                    </div>
                </div>
                {isMenuOpen && <div style={styles.overlay} onClick= {()=> setIsMenuOpen(false)}></div>}
                <div style={{ ...styles.drawer, transform: isMenuOpen? 'translateX(0)': 'translateX(-100%)', overflowY: 'auto' }} onScroll={(e) => { const { scrollTop, clientHeight, scrollHeight } = e.target; if (scrollHeight - scrollTop <= clientHeight + 5 && hasMoreAuthors) { setAuthorPage(prev => prev + 1); } }}>
                    <div style={styles.drawerHeader}><h2 style={styles.drawerTitle}>AUTHORS</h2><button style={styles.closeBtn} onClick={() => setIsMenuOpen(false)}>✕</button></div>
                    <ul style={styles.genreList}>{bookAuthors.map((author, index) => (<li key={index} style={styles.genreItem}><label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><input type="checkbox" checked={activeFilters.includes(`Author:${author}`)} onChange={(e) => { if (e.target.checked) { setActiveFilters(prev => [...prev, `Author:${author}`]); } else { setActiveFilters(prev => prev.filter(f => f !== `Author:${author}`)); } setCurrentPage(1); }} />{author}</label></li>))}</ul>
                </div>
                {/*
                BENİM ÇALIŞMA NOTLARIM:
                - <pre> : Normalde html'de 10 boşluk koysan bile 1 boşluk koyulur.
                  Ama pre ile koda nasıl yazarsan öyle çıkar, şekli bozulmaz.

                - JSON.stringify(books, null, 2) : O kitap verilerini string (yazı)
                  formatında ekrana getirir.
                  * 2: Her satırın başına 2 boşluk bırak demek.
                  * null: Hiçbir veriyi filtreleme, olduğu gibi yaz (filtre yok) demek.
                ================================================================
                */}
                <div style={styles.content}>
                    <h1 style={styles.title}>WELCOME TO YOUR BOOK HEAVEN</h1>
                    {/* YÜKLEME EKRANI VEYA KİTAP LİSTESİ */}
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                            <style>
                                {`
                                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                                `}
                            </style>
                            <div style={{ width: '60px', height: '60px', border: '6px solid rgba(64, 79, 59, 0.2)', borderTop: '6px solid #404F3B', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '25px' }}></div>
                            <h2 style={{ color: '#404F3B', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>Books are being placed on the shelves...</h2>
                        </div>
                    ) : (
                    <div style={styles.bookGrid}>
                        {books.map((book, index) => {
                            // 1. YENİ: Kullanıcının bu kitaba önceden verdiği oyu listeden buluyoruz
                            const myRatingObj = userRatings.find(item => item.isbn === book.isbn);

                            return (
                            <div key={index}
                                 style={{...styles.bookCard, transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)'}} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}
                               onClick={() => {
                                    // 1. KUSURSUZ VERİ ÇEKME: Yorum ve Puanı aynı kaynaktan (existingData) alıyoruz
                                    const existingData = userRatings.find(item => String(item.isbn) === String(book.isbn));

                                    // 2. Eğer veri varsa puanı ve yorumu güvenle değişkene atıyoruz
                                    const currentScore = existingData ? parseInt(existingData.score, 10) : 0;
                                    const currentText = (existingData && existingData.comments) ? existingData.comments : "";

                                    setSelectedBook(book);

                                    // 3. Penceredeki değerleri dolduruyoruz (Eski yorum artık textarea içine kesinlikle gelecek!)
                                    setScore(currentScore);
                                    setHoveredStar(0);
                                    setComment(currentText);

                                    setIsModalOpen(true);

                                    // Topluluk Yorumlarını Çekme
                                    setIsReviewsLoading(true);
                                    fetch(`http://localhost:8000/books/${book.isbn}/reviews`)
                                        .then(res => res.ok ? res.json() : { reviews: [] })
                                        .then(data => setBookReviews(data.reviews || []))
                                        .catch(err => { console.error(err); setBookReviews([]); })
                                        .finally(() => setIsReviewsLoading(false));
                                }}>
                                <div style={{...styles.bookCover, position: 'relative', overflow: 'hidden'}}>

                                    {/* 2. YENİ: EĞER KULLANICI OY VERMİŞSE SAĞ ÜST KÖŞEDE ETİKET ÇIKAR */}
                                    {myRatingObj && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            backgroundColor: '#C28F79',
                                            color: '#F3EFE9',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            zIndex: 2,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                            fontFamily: "sans-serif"
                                        }}>
                                            Your Vote: {myRatingObj.score} ★
                                        </div>
                                    )}

                                    {book.image_url ? (<img src={book.image_url} alt={book.title} style={{ width: '100%', height:'100%', objectFit:'cover', transition: 'filter 0.3s ease', filter: hoveredIndex === index ? 'blur(4px)' : 'none' }} onError={(e)=>{ e.target.onerror=null; e.target.src= "https://placehold.co/200x300/E3D8C8/323D2E?text=No+Cover"; }} />) : (<span style={{ fontSize: '40px', transition: 'filter 0.3s ease', filter: hoveredIndex === index ? 'blur(4px)' : 'none' }}>📖</span>)}
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(50, 61, 46, 0.9)', color: '#C28F79', padding: '12px 24px', borderRadius: '30px', fontFamily: "'Playfair Display', serif", fontSize: '16px', fontStyle: 'italic', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'opacity 0.3s ease, transform 0.3s ease', opacity: hoveredIndex === index ? 1 : 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{fontSize: '22px', marginTop: '-2px'}}>★</span> Rate Book</div>
                                </div>
                                <div style={styles.bookInfo}>
                                    <h3 style={styles.bookTitle}>{book.title || "Unknown Title"}</h3>
                                    <p style={styles.bookAuthor}>{book.author || "Unknown Author"}</p>
                                    <div style={styles.bookFooter}><span style={styles.bookYear}>{book.year || "N/A"}</span><span style={styles.bookRating}>⭐ {book.rating ? book.rating.toFixed(1) : "0.0"}</span></div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                    )}

                    {!isLoading && (
                        <div style={styles.paginationContainer}>
                            <button style={styles.pageBtn} onClick={()=> setCurrentPage(currentPage -1)} disabled={currentPage===1}> ◀ Prev</button>
                            {Array.from({length: totalPage}, (_,i) =>i+1).filter(pageNum=> pageNum===1 || pageNum===totalPage||Math.abs(currentPage-pageNum)<=2).map((pageNum, index,array) =>(
                                <React.Fragment key={pageNum}>
                                    {index > 0 && pageNum - array[index - 1] > 1 && <span style={{color: '#404F3B', padding:'0 5px'}}>...</span>}
                                    <button style={currentPage===pageNum ? styles.activePageBtn:styles.pageBtn} onClick={()=> setCurrentPage(pageNum)}>{pageNum}</button>
                                </React.Fragment>
                            ))}
                            <button style={styles.pageBtn} onClick={()=> setCurrentPage(currentPage+1)} disabled={currentPage === totalPage}>Next ▶</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALLAR EN DIŞTA (KATMAN SORUNU ÇÖZÜLDÜ) --- */}
            {settingsAction && (
                <div style={styles.modalOverlay} onClick={() => { setSettingsAction(null); }}>
                    <div style={{...styles.modalContent, width: '400px'}} onClick={(e) => e.stopPropagation()}>
                        <button style={styles.modalCloseBtn} onClick={() => { setSettingsAction(null); }}>X</button>
                        <h3 style={{ color: '#323D2E', marginTop: 0, fontFamily: "'Playfair Display', serif" }}>
                            {settingsAction === 'username' && "Change username"}
                            {settingsAction === 'password' && "Change password"}
                            {settingsAction === 'delete' && "Delete account"}
                        </h3>
                        {settingsAction === 'username' && (
                            <>
                                <p style={{ fontSize: '13px', color: '#5D4037', marginBottom: '15px' }}>Current username: <strong>{userName}</strong></p>
                                <input type="text" placeholder="New User Name" value={settingsInput1} onChange={e => setSettingsInput1(e.target.value)} style={styles.modalInput} />
                            </>
                        )}
                        {settingsAction === 'password' && (
                            <>
                                <input type="password" placeholder="Current Password" value={settingsInput1} onChange={e => setSettingsInput1(e.target.value)} style={styles.modalInput} />
                                <input type="password" placeholder="New Password" value={settingsInput2} onChange={e => setSettingsInput2(e.target.value)} style={styles.modalInput} />
                            </>
                        )}
                        {settingsAction === 'delete' && (<p style={{ color: '#D32F2F', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px' }}>Your entire reading history, votes and comments will be permanently deleted. This action is absolutely irreversible. Are you sure?</p>)}
                        <button onClick={handleSettingsSubmit} style={{...styles.saveBtn, width: '100%', backgroundColor: settingsAction === 'delete' ? '#D32F2F' : '#404F3B'}}>{settingsAction === 'delete' ? "Yes, Delete my Account Permanently" : "Update"}</button>
                    </div>
                </div>
            )}

            {isModalOpen && selectedBook && (
                <div style={styles.modalOverlay} onClick={() => { setIsModalOpen(false); setComment(""); setScore(0); setBookReviews([]); }}>
                    <div style={{...styles.modalContent, width: '550px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '30px'}} onClick={(e) => e.stopPropagation()}>

                        <button style={styles.modalCloseBtn} onClick={() => { setIsModalOpen(false); setComment(""); setScore(0); setBookReviews([]); }}>X</button>

                        <h3 style={{ color: '#323D2E', marginTop: 0, marginBottom: '20px', fontFamily: "'Playfair Display', serif", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textAlign: 'center' }}>
                            {selectedBook.title}
                        </h3>

                        {/* 1. KATMAN: KULLANICININ YILDIZ VERME KISMI */}
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px'}}>
                            <p style={{fontSize: '14px', color: '#5D4037', margin: '0 0 10px 0'}}>How many stars do you give?</p>
                            <div style={{display: 'flex', gap: '8px'}}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    // KESİN VE HATASIZ YILDIZ MANTIĞI:
                                    // Fare üstündeyse fareyi, değilse verilmiş olan puanı baz al
                                    const activeScore = hoveredStar > 0 ? hoveredStar : score;
                                    const isFilled = star <= activeScore;

                                    return (
                                    <span key={star}
                                          onClick={() => setScore(star)}
                                          onMouseEnter={()=> setHoveredStar(star)}
                                          onMouseLeave={() => setHoveredStar(0)}
                                          style={{
                                              cursor: 'pointer',
                                              fontSize: '40px',
                                              color: isFilled ? '#C28F79' : 'rgba(50, 61, 46, 0.15)',
                                              transition: 'color 0.2s ease, transform 0.2s',
                                              transform: star === hoveredStar ? 'scale(1.15)' : 'scale(1)'
                                          }}>
                                        ★
                                    </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. KATMAN: YORUM YAZMA ALANI VE KAYDET BUTONU (ARTIK HER ZAMAN AÇIK!) */}
                        <div style={{marginBottom: '25px'}}>
                            <textarea placeholder="Write your review here (Max 250 characters)..." value={comment} maxLength={250} onChange={(e) => setComment(e.target.value)} style={{...styles.modalInput, height: '90px', resize: 'none', marginBottom: '5px'}} />
                            <p style={{fontSize: '12px', color: '#90A08C', textAlign: 'right', marginTop: '0', marginBottom: '15px'}}>{comment.length} / 250 characters</p>
                            <button style={{...styles.saveBtn, width: '100%', fontSize: '15px'}} onClick={async () => {
                                if (score === 0) { showToast("Please select a star rating first!", "error"); return; }
                                try {
                                    const response = await fetch(`http://localhost:8000/rate?user_id=${currentUserId}`, {
                                        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ book_isbn: selectedBook.isbn, score: score, comments: comment })
                                    });
                                    if (response.ok) {
                                        showToast("Rating saved successfully! ✨", "success");
                                        setRefreshTrigger(prev => prev + 1);
                                        setIsModalOpen(false);
                                        setComment("");
                                        setScore(0);
                                        setHoveredStar(0);
                                    }
                                } catch (e) {
                                    console.error("rating could not saved", e);
                                    showToast("An error occurred.", "error");
                                }
                            }}>
                                Save Rating
                            </button>
                        </div>

                        {/* 3. KATMAN: TOPLULUK YORUMLARI */}
                        <div style={{flex: 1, overflowY: 'auto', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(50, 61, 46, 0.15)', minHeight: '120px'}}>
                            <h4 style={{margin: '0 0 15px 0', color: '#404F3B', fontSize: '15px', borderBottom: '2px solid rgba(194, 143, 121, 0.3)', paddingBottom: '8px', fontFamily: "'Playfair Display', serif"}}>Community Reviews</h4>

                            {isReviewsLoading ? (
                                <div style={{textAlign: 'center', color: '#90A08C', fontSize: '14px', marginTop: '20px'}}>Loading reviews...</div>
                            ) : bookReviews.length > 0 ? (
                                bookReviews.map((rev, idx) => (
                                    <div key={idx} style={{marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px dashed rgba(50,61,46,0.1)'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}>
                                            <span style={{fontWeight: 'bold', fontSize: '13px', color: '#323D2E'}}>@{rev.username}</span>
                                            <span style={{color: '#C28F79', fontSize: '14px', fontWeight: 'bold'}}>{rev.score} ★</span>
                                        </div>
                                        <p style={{margin: 0, fontSize: '13px', color: '#5D4037', fontStyle: 'italic', lineHeight: '1.4'}}>"{rev.comments}"</p>
                                    </div>
                                ))
                            ) : (
                                <div style={{textAlign: 'center', color: '#90A08C', fontSize: '13px', marginTop: '20px'}}>No reviews yet. Be the first to share your thoughts!</div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* --- ÖNERİ SİSTEMİ PANELİ (SAĞDAN AÇILIR) --- */}
            {isSuggestionsOpen && (
                <>
                    <div style={{...styles.overlay, zIndex: 1001}} onClick={() => setIsSuggestionsOpen(false)}></div>
                    <div style={{
                        position: 'fixed', top: 0, right: 0, width: '450px', maxWidth: '100%', height: '100vh',
                        backgroundColor: '#FCFAF8', zIndex: 1002, transition: 'transform 0.4s ease',
                        transform: isSuggestionsOpen ? 'translateX(0)' : 'translateX(100%)',
                        boxShadow: '-4px 0 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Başlık ve Kapatma Butonu */}
                        <div style={{ padding: '30px', backgroundColor: '#404F3B', color: '#F3EFE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: '22px' }}>✨ AI Suggestions</h2>
                            <button onClick={() => setIsSuggestionsOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', color: '#F3EFE9', fontSize: '24px', cursor: 'pointer' }}>✕</button>
                        </div>

                        {/* Arama Çubuğu */}
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(50, 61, 46, 0.1)' }}>
                            <p style={{ fontSize: '13px', color: '#5D4037', margin: '0 0 10px 0', fontWeight: 'bold' }}>Based on your highest ratings, or search a favorite book:</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="e.g. Harry Potter..."
                                    value={favoriteBookInput}
                                    onChange={(e) => setFavoriteBookInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('askAiBtn').click(); }}
                                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
                                />
                                <button
                                    id="askAiBtn"
                                    style={{ padding: '10px 15px', backgroundColor: '#C28F79', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    onClick={async () => {
                                        setIsSuggesting(true);
                                        try {
                                            const url = favoriteBookInput
                                                ? `http://localhost:8000/suggestions?user_id=${currentUserId}&search_query=${encodeURIComponent(favoriteBookInput)}`
                                                : `http://localhost:8000/suggestions?user_id=${currentUserId}`;
                                            const response = await fetch(url);
                                            const data = await response.json();
                                            if(data.suggestions && data.suggestions.length > 0) {
                                                setSuggestedBooks(data.suggestions);
                                            } else {
                                                showToast(data.message || "No suggestions found.", "error");
                                                setSuggestedBooks([]);
                                            }
                                        } catch(error) {
                                            console.error("AI Error:", error);
                                            showToast("An error occurred.", "error");
                                        } finally {
                                            setIsSuggesting(false);
                                        }
                                    }}
                                >Ask AI</button>
                            </div>
                        </div>

                        {/* Önerilen Kitaplar Listesi */}
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                            {isSuggesting ? (
                                <div style={{ textAlign: 'center', marginTop: '50px', color: '#5D4037' }}>
                                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                                    <span style={{ fontSize: '40px', display: 'inline-block', animation: 'spin 2s linear infinite' }}>⚙️</span>
                                    <p>AI is analyzing  your books for recommendation...</p>
                                </div>
                            ) : suggestedBooks.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {suggestedBooks.map((book, index) => (
                                        <div key={index} style={{ position: 'relative', padding: '10px', backgroundColor: '#F3EFE9', borderRadius: '8px', border: '1px solid rgba(50, 61, 46, 0.1)', cursor: 'pointer', overflow: 'hidden' }}
                                        onMouseEnter={() => setHoveredSuggestionIndex(index)}
                                        onMouseLeave={() => setHoveredSuggestionIndex(null)}
                                        onClick={() => {
                                            const currentScore= myRatingObj ? parseInt(myRatingObj.score): 0;
                                            const currentComment = myRatingObj ? myRatingObj.comments:"";
                                            setSelectedBook(book);
                                            const existingRating = userRatings.find(item => item.isbn === book.isbn);
                                            const existingComment = userComments.find(item => item.isbn === book.isbn);
                                            setScore(currentScore);
                                            setHoveredStar(0);
                                            setComment(currentComment || "");
                                            setShowReviewInput(currentComment ? true: false);
                                            setIsModalOpen(true);
                                            setIsReviewsLoading(true);
                                            fetch(`http://localhost:8000/books/${book.isbn}/reviews`)
                                                .then(res => res.ok ? res.json() : {reviews: []})
                                                .then(data => setBookReviews(data.reviews || []))
                                                .catch(e => {console.error(e); setBookReviews([]); })
                                                .finally(()=>setIsReviewsLoading(false));
                                        }}>
                                            {/* 1. KATMAN: KİTAP BİLGİLERİ (Fare Üzerine Gelince Bulanıklaşacak) */}
                                            <div style={{ display: 'flex', gap: '15px', transition: 'filter 0.3s ease', filter: hoveredSuggestionIndex === index ? 'blur(4px)' : 'none' }}>
                                                <div style={{ width: '60px', height: '90px', backgroundColor: '#E3D8C8', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                                                    {book.image_url ? <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📖</span>}
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#323D2E', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</h4>
                                                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#5D4037', fontStyle: 'italic' }}>{book.author}</p>
                                                    <span style={{ fontSize: '12px', color: '#D4AF37', fontWeight: 'bold' }}>⭐ {book.rating ? book.rating.toFixed(1) : "0.0"}</span>
                                                </div>
                                            </div>

                                            {/* 2. KATMAN: YAPAY ZEKA YORUMU (Sadece Fare Üzerindeyken Görünür) */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(64, 79, 59, 0.85)', color: '#F3EFE9', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontStyle: 'italic', opacity: hoveredSuggestionIndex === index ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none', zIndex: 10 }}>
                                                {book.ai_comment || "✨ Algoritmamız bu kitabın tarzına çok uygun olduğunu düşünüyor."}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', color: '#90A08C', marginTop: '50px' }}>Buraya az sonra yapay zekanın seçtiği harika kitaplar gelecek!</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {isExpandedRatingsOpen && (
                <div style={styles.modalOverlay} onClick={() => setIsExpandedRatingsOpen(false)}>
                    <div style={{...styles.modalContent, width: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0}} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(50, 61, 46, 0.2)', backgroundColor: '#F3EFE9', position: 'relative' }}>
                            <button style={{ ...styles.tabBtn, padding: '20px', fontSize: '16px', ...(starTab === 'ratings' ? { borderBottom: '3px solid #404F3B', color: '#404F3B' } : {}) }} onClick={() => setStarTab('ratings')}>My Ratings</button>
                            <button style={{ ...styles.tabBtn, padding: '20px', fontSize: '16px', ...(starTab === 'comments' ? { borderBottom: '3px solid #404F3B', color: '#404F3B' } : {}) }} onClick={() => setStarTab('comments')}>My Comments</button>
                            <button style={{ position: 'absolute', top: '15px', right: '20px', backgroundColor: 'transparent', border: 'none', fontSize: '24px', color: '#90A08C', cursor: 'pointer' }} onClick={() => setIsExpandedRatingsOpen(false)}>✕</button>
                        </div>
                        <div style={{ padding: '30px', overflowY: 'auto', flex: 1, backgroundColor: '#FCFAF8' }}>
                            {starTab === 'ratings' ? (userRatings.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {userRatings.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(50, 61, 46, 0.1)', paddingBottom: '20px', alignItems: 'center' }}>
                                            <div style={{ width: '80px', height: '115px', backgroundColor: '#E3D8C8', flexShrink: 0, borderRadius: '6px', overflow: 'hidden' }}>{item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '30px' }}>📖</div>}</div>
                                            <div style={{ flex: 1, textAlign: 'left' }}><h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#323D2E', fontFamily: "'Playfair Display', serif" }}>{item.title}</h3><div style={{ color: '#C28F79', fontSize: '20px', fontWeight: 'bold' }}>{item.score} ★</div></div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button onClick={() => handleEditAction(item)} style={{ padding: '8px 12px', backgroundColor: 'transparent', color: '#404F3B', border: '1px solid #404F3B', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Update</button>
                                                <button onClick={() => handleSpecificDelete(item.isbn, 'rating')} style={{ padding: '8px 12px', backgroundColor: 'transparent', color: '#D32F2F', border: '1px solid #D32F2F', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p style={{ textAlign: 'center' }}>You haven't rated any books yet.</p>) : (userComments.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {userComments.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(50, 61, 46, 0.1)', paddingBottom: '20px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '80px', height: '115px', backgroundColor: '#E3D8C8', flexShrink: 0, borderRadius: '6px', overflow: 'hidden' }}>{item.image_url ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '30px' }}>📖</div>}</div>
                                            <div style={{ flex: 1, textAlign: 'left' }}><h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#323D2E' }}>{item.title}</h3><p style={{ margin: 0, fontSize: '14px', color: '#5D4037', fontStyle: 'italic', padding: '12px', borderRadius: '6px' }}>"{item.comments}"</p></div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button onClick={() => handleEditAction(item)} style={{ padding: '8px 12px', backgroundColor: 'transparent', color: '#404F3B', border: '1px solid #404F3B', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Update</button>
                                                <button onClick={() => handleSpecificDelete(item.isbn, 'comment')} style={{ padding: '8px 12px', backgroundColor: 'transparent', color: '#D32F2F', border: '1px solid #D32F2F', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p style={{ textAlign: 'center' }}>You haven't commented on any books yet.</p>)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const getStyles =(theme) => ( {
    // (Stillerini değiştirmeden buraya aynen bırakabilirsin)
    container: {
        backgroundColor: theme.bgMain,
        minHeight: '100vh',
        fontFamily: "'Playfair Display', serif",
        margin: 0,
        padding: 0,
        overflowX: 'hidden',
        position: 'static',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 40px',
        backgroundColor: theme.topBarBg,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(50, 61, 46, 0.15)',
        position: 'relative',
        zIndex: 10,
    },
    brand: {
        fontFamily: "'Playfair Display', serif",
        fontWeight: 'bold',
        fontSize: '20px',
        color: theme.textMain,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        letterSpacing: '1px',
    },
    spine: {
        width: '4px',
        height: '22px',
        backgroundColor: theme.textMain,
        borderRadius: '2px',
    },
    sideBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: theme.textMain,
        fontSize: '30px',
        cursor: 'pointer',
    },
    searchInput: {
        width: '40%',
        padding: '12px 20px',
        borderRadius: '30px',
        border: '1px solid rgba(50, 61, 46, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        color: theme.textMain,
        fontSize: '16px',
        outline: 'none',
    },
    profileArea: {
        color: theme.textMain,
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        backgroundColor: theme.textMain,
        color: '#F3EFE9',
        padding: '8px 12px',
        borderRadius: '50%',
        fontWeight: 'bold',
        fontSize: '16px',
        fontFamily: "sans-serif",
    },
    toolbar: { display: 'flex',
        alignItems: 'center',
        padding: '15px 40px',
        borderBottom: '1px solid rgba(50, 61, 46, 0.15)',
        gap: '12px' },
    groupLabel: { fontSize: '11px',
        color: theme.textMain,
        letterSpacing: '1px',
        fontWeight: 'bold' },
    dropdownBtn: { padding: '8px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '6px',
        fontSize: '13px',
        color: theme.textMain ,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center' },
    dropdownMenu: { position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '8px',
        backgroundColor: '#F3EFE9',
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '6px',
        width: '160px',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' },
    filterMenu: { position: 'absolute',
        top: '100%',
        left: 0,
        marginTop: '8px',
        backgroundColor: '#F3EFE9',
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '6px',
        width: '220px',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' },
    dropdownItem: { padding: '10px 16px',
        fontSize: '13px', color: theme.textMain,
        cursor: 'pointer',
        borderBottom: '1px solid rgba(50, 61, 46, 0.05)',
        fontFamily: "sans-serif" },
    backBtn: { padding: '10px 16px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#5D4037',
        cursor: 'pointer',
        borderBottom: '1px solid rgba(50, 61, 46, 0.1)',
        backgroundColor: 'rgba(50, 61, 46, 0.05)' },
    applyBtn: { width: '100%',
        padding: '8px',
        marginTop: '10px',
        backgroundColor: '#404F3B',
        color: '#F3EFE9',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontFamily: "sans-serif" },
    chip: {
        padding: '6px 14px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '20px',
        fontSize: '13px',
        color: theme.textMain,
        display: 'flex',
        alignItems: 'center' },
    content: {
        padding: '50px',
        textAlign: 'center',
    },
    title: {
        color: theme.textMain,
        fontSize: '36px',
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 998,
    },
    drawer: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: '#404F3B',
        borderRight: '1px solid rgba(243, 239, 233, 0.1)',
        zIndex: 999,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)',
        padding: '30px 20px',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
    },
    drawerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
    },
    drawerTitle: {
        color: '#E3D8C8',
        margin: 0,
        fontSize: '22px',
        letterSpacing: '2px',
    },
    closeBtn: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#A8B3A1',
        fontSize: '24px',
        cursor: 'pointer',
    },
    genreList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    genreItem: {
        color: '#F3EFE9',
        fontSize: '18px',
        padding: '15px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        cursor: 'pointer',
        fontFamily: "sans-serif",
    },
    bookGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '30px',
        marginTop: '40px',
        padding: '0 20px',
        position: 'relative',
        zIndex: 1,
    },
    bookCard: {
        backgroundColor: theme.bgCard,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid rgba(50, 61, 46, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        cursor: 'pointer',
    },
    bookCover: {
        height: '240px',
        backgroundColor: '#E3D8C8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        borderBottom: '1px solid rgba(50, 61, 46, 0.08)',
    },
    bookInfo: {
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    bookTitle: {
        fontSize: '15px',
        color: theme.textMain,
        margin: '0 0 5px 0',
        fontWeight: 'bold',
        fontFamily: "sans-serif",
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    bookAuthor: {
        fontSize: '13px',
        color: theme.textMain,
        margin: '0 0 15px 0',
        fontStyle: 'italic',
    },
    bookFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    bookYear: {
        fontSize: '12px',
        color: '#90A08C',
        fontWeight: 'bold',
    },
    bookRating: {
        fontSize: '13px',
        color: '#D4AF37',
        fontWeight: 'bold',
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        marginTop: '50px',
        paddingBottom: '40px',
    },
    pageBtn: {
        padding: '8px 16px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '6px',
        color: theme.textMain,
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s',
        fontFamily: "sans-serif",
    },
    activePageBtn: {
        padding: '8px 16px',
        backgroundColor: '#404F3B',
        border: '1px solid #404F3B',
        borderRadius: '6px',
        color: '#F3EFE9',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontFamily: "sans-serif",
    },
    jumpInput: {
        width: '60px',
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        textAlign: 'center'
    },
    starMenu: {
        position: 'absolute',
        top: '140%',
        right: '-50px',
        backgroundColor: theme.bgMenu,
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '8px',
        width: '280px',
        zIndex: 1000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'default',
    },
    tabContainer: {
        display: 'flex',
        borderBottom: '1px solid rgba(50, 61, 46, 0.1)',
    },
    tabBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#90A08C',
        cursor: 'pointer',
        fontFamily: "sans-serif",
        fontSize: '13px',
        fontWeight: 'bold',
        transition: 'all 0.2s',
    },
    activeTabBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: 'rgba(64, 79, 59, 0.05)',
        border: 'none',
        borderBottom: '3px solid #404F3B',
        color: '#404F3B',
        cursor: 'pointer',
        fontFamily: "sans-serif",
        fontSize: '13px',
        fontWeight: 'bold',
        transition: 'all 0.2s',
    },
    starContent: {
        padding: '30px 20px',
        minHeight: '120px',
        fontSize: '13px',
        color: '#5D4037',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "sans-serif",
    },
    settingsMenu: {
        position: 'absolute',
        top: '140%',
        right: '-10px',
        backgroundColor: theme.bgMenu,
        border: '1px solid rgba(50, 61, 46, 0.2)',
        borderRadius: '8px',
        width: '220px',
        zIndex: 1000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    settingsHeader: {
        padding: '12px 16px 6px 16px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#90A08C',
        letterSpacing: '1px',
        fontFamily: "sans-serif",
    },
    settingsItem: {
        padding: '10px 16px',
        fontSize: '13px',
        color: theme.textMain,
        cursor: 'pointer',
        fontFamily: "sans-serif",
        transition: 'background-color 0.2s',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
    },
    modalContent: {
        backgroundColor: theme.bgMenu,
        padding: '40px',
        borderRadius: '12px',
        width: '700px',
        maxWidth: '90%',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    },
    modalCloseBtn: {
        position: 'absolute',
        top: '15px',
        right: '20px',
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '24px',
        color: '#90A08C',
        cursor: 'pointer',
    },
    modalInput: {
        width: '100%',
        padding: '10px 15px',
        marginBottom: '15px',
        borderRadius: '6px',
        border: '1px solid rgba(50, 61, 46, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        color: '#323D2E',
        fontFamily: "sans-serif",
        boxSizing: 'border-box',
        outline: 'none'
    },
    saveBtn: {
        padding: '12px',
        backgroundColor: '#404F3B',
        color: '#F3EFE9',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    deleteBtn: {
        padding: '12px',
        backgroundColor: 'transparent',
        color: '#D32F2F',
        border: '1px solid #D32F2F',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },

});

export default Home;