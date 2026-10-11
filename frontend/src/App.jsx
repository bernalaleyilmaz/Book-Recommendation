
import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // react-router paketinden ihtiyacımız olan 3 şeyi aldık
import Login from "./Login";
import Home from "./Home";

function App() { // frontendin ana motoru
  return (
    <BrowserRouter>
      {/* Kullanıcı adrese ne yazıyor buna bakıyor, yönlendirme yapıyor. Bu bloğun içine kod yazıyorum ve o sayede çalışıyor. bir nevi bir tiyatro oyunu yaptık */}

      <Routes>
        {/* Kullanıcının ne görmek istediğine bakar. Bu sistem olmasaydı her yeni sayfa için sahneyi yıkıp tekrar inşa edilirdi. */}

        {/* Kullanıcı siteye girdiğinde login sayfası açılacak. Element login demek Login sayfasını getir demektir. */}
        <Route path="/" element={<Login />} />
          {/*adres çubuğunda home yazarsa Home ekranını getir demek  */}
          <Route path="/home" element={<Home/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;


// scalable bir yapıda  kurmak istedim router-dom altyapısını baştan kurmasaydım sayfalar arası geçiş için reload yapmam gerekiyordu sayfalar arası geçişler için arka planda yenileme yapılmıyor