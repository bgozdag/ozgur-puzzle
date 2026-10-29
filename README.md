# Dino Yapboz

Çocuklar için dinozor puzzle oyunu. Android ve iOS'ta çalışır (Expo / React Native).

## Özellikler

- Giriş ekranında çocuk adını yazar; daha önce oynayanlar listede çıkar (silmek için isme basılı tut).
- 20 çizgi film dinozoru, her biri kendi sahnesinde. Tüm çizimler kodla (SVG) yapılmıştır.
- Puzzle'lar sırayla açılır: çözülenlerde yeşil tik ve en iyi yıldızlar görünür, sıradaki vurgulanır, diğerleri kilitlidir.
- Her puzzle 8, 14, 20 veya 32 parça olarak oynanabilir.
- Parçalar parmakla sürüklenir; doğru yere yaklaşınca "tık" sesiyle yerine oturur, yanlış yere bırakılırsa geri döner.
- Puzzle bitince dinozor dans eder, kutlama şarkısı çalar, konfeti yağar. Dinozora dokununca takla atar ve şarkı tekrar çalar.

## Puan skalası

| Parça | Hedef süre | 3 yıldız (hedefte) | 2 yıldız (2 x hedef) | 1 yıldız |
|------:|-----------:|-------------------:|---------------------:|---------:|
| 8     | 1 dk       | 300                | 200                  | 100      |
| 14    | 2 dk       | 600                | 400                  | 200      |
| 20    | 3 dk       | 900                | 600                  | 300      |
| 32    | 5 dk       | 1500               | 1000                 | 500      |

Toplam puan, her puzzle ve parça sayısı için elde edilen en iyi puanların toplamıdır.
Ayarlar `src/game/scoring.ts` dosyasındadır.

## Çalıştırma

```bash
npm install
npx expo start
```

Telefona **Expo Go** uygulamasını kurup terminaldeki QR kodu okut (telefon ve bilgisayar aynı Wi-Fi'da olmalı).

Mağaza için derleme: `npx eas-cli@latest build --platform android` / `--platform ios`.

## Yapı

- `src/app/` – ekranlar (Expo Router): giriş, puzzle listesi, parça seçimi, oyun
- `src/dinos/` – dinozor karakterleri, sahneler, aksesuarlar ve 20 dinozorun listesi (`data.ts`)
- `src/game/` – parça yerleşimi, sürüklenen parça, oyun tahtası, kutlama, puanlama
- `src/state/profiles.tsx` – çocuk profilleri ve ilerleme (cihazda saklanır)
- `scripts/generate-sounds.mjs` – kutlama şarkısını ve efekt seslerini üretir (`npm run generate-sounds`)
