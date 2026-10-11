import React, { useState } from "react";
import axios from 'axios'; // axios fastapi ve react arasında veri taşıyan http istemcisi
import {useNavigate} from 'react-router-dom';

const styles = {
    container: {
        position: 'fixed', // Ekranı kilitle, sağda solda boşluk kalmasını engeller
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column', // Kutuların alt alta dizilmesi için eklendi
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
    },
    videoBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover', // video sığıyor tüm ekrana
        zIndex: -1,
        filter: 'blur(5px) brightness(0.55)',
    },
    glassBox: {
        backgroundColor: 'rgba(50, 30, 20, 0.5)',
        backdropFilter: 'blur(12px)',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '360px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        zIndex: 1, // Kutu önde dursun
    },
    title: {
        color: '#F5F5DC',
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        fontFamily: "'Playfair Display', serif",
    },
    input: {
        padding: '13px',
        borderRadius: '8px',
        border: 'none',
        outline: 'none',
        fontSize: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        color: '#333',
    },
    loginButton: {
        padding: '14px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#D4A373',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'transform 0.2s ease',
    },
    registerToggleText: {
        padding: '10px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#E9EDC9',
        fontSize: '14px',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    // aşağıdaki kutular
    infoWrapper: {
        display: 'flex',
        gap: '20px',
        marginTop: '40px',
        maxWidth: '900px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '0 20px',
        zIndex: 1,
    },
    infoBox: {
        backgroundColor: 'rgba(50, 30, 20, 0.4)',
        backdropFilter: 'blur(8px)',
        padding: '20px',
        borderRadius: '12px',
        color: '#F3EFE9',
        flex: '1 1 250px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s ease',
    },
    infoIcon: {
        fontSize: '30px',
        marginBottom: '10px',
    },
    infoTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#D4A373',
        fontFamily: "'Playfair Display', serif",
    },
    infoText: {
        fontSize: '13px',
        lineHeight: '1.5',
        color: '#E9EDC9',
    }
};

// ANA MOTOR
function Login() {
    // Ekranın modunu tutan hafıza (Giriş ekranında mıyız, Kayıt ekranında mı?)
    const [isLogin, setIsLogin] = useState(true); // islogin o an giriş ekrannda mı yoksa kayıt ekranında mı olduğunu tutar
    const navigate = useNavigate();

    // Form hafızaları
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // TOAST  SİSTEMİ (üstteki bildirimler)
    const [toast, setToast] = useState(null);
    const showToast = (message, type, callback) => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
            if (callback) callback();
        }, 2000); // 2 saniye ekranda kalır
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Sayfanın eski usül yenilenmesini engelliyor
        console.log("Gönderilen kullanıcı adı:", username);
        console.log("Gönderilen şifre:", password);

        /* async ve await tek bir thread ile çalışırlar ve fastapiden bir komut gelene kadar bekle ama kullanıcı ana ekranda başka butonlara tıklayabilir animasyonu görebilir bu bir yield(iş devretme) mekanizması javadaki sleep gibi sistemi tamamen kilitlemez */

       if (isLogin) {
           try {
               const response = await axios.post('http://127.0.0.1:8000/login', {
                   username: username,
                   password: password
               });
               console.log("Backendden Gelen Login Verisi:", response.data);
               localStorage.setItem("userId", response.data.user_id);
               localStorage.setItem("username", response.data.username); // veriyi tarayıcı hafızasına kaydediyor
               showToast("Login successful! Welcome " + response.data.username + " 👾", "success", () => {
                   navigate('/home', {
                       state: {
                           userId: response.data.user_id,
                           username: response.data.username
                       }
                   });
               });

           } catch (error) {
               if (error.response && error.response.data && error.response.data.detail) {
                   showToast("Login Error: " + error.response.data.detail, "error");
               } else {
                   showToast("An error occurred while connecting to the server.", "error");
               }
           }

        } else {
            try {
                const response = await axios.post('http://127.0.0.1:8000/register', {
                    name: firstName,
                    surname: lastName,
                    username: username,
                    password: password
                });

                // Alert yerine zarif Toast bildirimi
                showToast("Register is successful! You can login now! ✨", "success", () => {
                    setIsLogin(true); // Kayıt başarılıysa otomatik giriş ekranına döndürüyo
                });

            } catch (error) {
                if(error.response && error.response.data && error.response.data.detail){
                    showToast("Register Error: " + error.response.data.detail, "error");
                } else {
                    showToast("Register Error: An unexpected error occured on the server.", "error");
                }
            }
        }
    };

    return (
        <div style={styles.container}>

            {/*  TOAST */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: toast.type === 'success' ? '#404F3B' : '#D32F2F',
                    color: '#F3EFE9',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(50, 61, 46, 0.4)',
                    border: toast.type === 'success' ? '1px solid #C28F79' : '1px solid rgba(255,255,255,0.3)',
                    zIndex: 99999999,
                    fontWeight: 'bold',
                    fontFamily: "'Playfair Display', serif",
                    animation: 'fadeIn 0.3s ease-in-out',
                    letterSpacing: '1px'
                }}>
                    {toast.message}
                </div>
            )}

            <video autoPlay loop muted style={styles.videoBackground}>
                <source src="/arkap-plan.mp4" type="video/mp4" />
            </video>

            <div style={styles.glassBox}>
                <h1 style={styles.title}>
                    {isLogin ? <>Welcome to <br />BOOK HEAVEN </> : "Create New Account"}
                    {/* div dediğimiz şey bir kutu gibi bir şey  için eyazıları butonları falan ekliyoruz ki toplu orda dursunlar h1 ise en dikkat çeken en klaın başlığı yazmak için kullanıyoruz daha küçükleri h2 h3 diye gider */}
                </h1>

                {/* Sadece Kayıt modundayken (isLogin false) İsim ve Soyisim kutularını göster */}
                {!isLogin && (
                    <>
                        <input
                            type="text"
                            placeholder="First Name"
                            style={styles.input}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            style={styles.input}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </>
                )}

                <input // username butonu
                    type="text"
                    placeholder="Username"
                    style={styles.input}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input // password butonu
                    type="password"
                    placeholder="Password"
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    style={styles.loginButton}
                    onClick={handleSubmit}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {isLogin ? "Login" : "Register"}
                    {/*  islogin şuan giriş ekranı da mıyız diye bakıyor evetse login değilse register ekranındayız demek*/}
                </button>

                {/* Ekranlar arası geçiş yapmayı sağlayan alt yazı */}
                <button style={styles.registerToggleText} onClick={(e) => {
                    e.preventDefault(); // kayıt geçiş yazısını çağırıyor javascript içindeki css objesinden özel bi stil sınıfı atadık
                    setIsLogin(!isLogin); // burda ekranı değiştiren  kısım login ekranındaysak tam tersini yapar kayıt ekranına çevirir
                }}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
            </div>
            {/*  şeffaf bilgi  kutuları */}
            <div style={styles.infoWrapper}>
                <div style={styles.infoBox} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.infoIcon}>⭐</div>
                    <div style={styles.infoTitle}>Rate Your Favorites</div>
                    <div style={styles.infoText}>Discover thousands of books, rate the ones you've read, and keep track of your reading journey.</div>
                </div>

                <div style={styles.infoBox} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.infoIcon}>🤝</div>
                    <div style={styles.infoTitle}>Share & Recommend</div>
                    <div style={styles.infoText}>Share your thoughts through comments and help others discover their next favorite adventure.</div>
                </div>

                <div style={styles.infoBox} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={styles.infoIcon}>✨</div>
                    <div style={styles.infoTitle}>AI Suggestions</div>
                    <div style={styles.infoText}>Get smart, AI-powered book recommendations tailored specifically to your unique taste.</div>
                </div>
            </div>

        </div>
    );
}

export default Login;