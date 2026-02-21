#!/bin/bash
# =============================================================================
# Fix: create missing subcategories + update all product images to placehold.co
# =============================================================================
set -e

API="http://localhost:5200"

# --- Get token ---
echo "[1/3] Autenticando..."
FULL_RESP=$(curl -s -X POST "http://localhost:8081/realms/kll-platform/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=storefront&username=admin&password=REDACTED_SEQ_PASSWORD")
TOKEN="${FULL_RESP#*\"access_token\":\"}"
TOKEN="${TOKEN%%\"*}"

if [ ${#TOKEN} -lt 100 ]; then
  echo "ERRO: Token invalido (${#TOKEN} chars). Resposta: ${FULL_RESP:0:200}"
  exit 1
fi
echo "  Token OK (${#TOKEN} chars)"

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# --- Create missing subcategories ---
echo ""
echo "[2/3] Criando subcategorias faltantes..."

CAT_ELETRONICOS="ac589739-e956-4020-bd70-ae4bf9858f49"

# Delete test category if exists
curl -s -X DELETE "$API/api/v1/categories/1cdd190e-40b1-4e4a-bd01-ec1901cc2838" -H "$AUTH" > /dev/null 2>&1

# Check if Acessorios Tech exists
CATS=$(curl -s "$API/api/v1/categories")

has_category() {
  echo "$CATS" | grep -q "\"name\":\"$1\""
}

if ! has_category "Acessorios Tech"; then
  RESP=$(curl -s -X POST "$API/api/v1/categories" -H "$AUTH" -H "$CT" \
    -d "{\"name\":\"Acessorios Tech\",\"description\":\"Perifericos e acessorios tecnologicos\",\"parentCategoryId\":\"$CAT_ELETRONICOS\"}")
  echo "  Criado: Acessorios Tech"
else
  echo "  Ja existe: Acessorios Tech"
fi

if ! has_category "Wearables"; then
  RESP=$(curl -s -X POST "$API/api/v1/categories" -H "$AUTH" -H "$CT" \
    -d "{\"name\":\"Wearables\",\"description\":\"Relogios e dispositivos vestiveis inteligentes\",\"parentCategoryId\":\"$CAT_ELETRONICOS\"}")
  echo "  Criado: Wearables"
else
  echo "  Ja existe: Wearables"
fi

# Refresh categories list
CATS=$(curl -s "$API/api/v1/categories")

# Build category ID map
echo ""
echo "  Categorias atualizadas:"
echo "$CATS" | sed 's/},{/}\n{/g' | while IFS= read -r line; do
  name="${line#*\"name\":\"}"
  name="${name%%\"*}"
  id="${line#*\"id\":\"}"
  id="${id%%\"*}"
  echo "    $name = $id"
done

# --- Update all products with placehold.co images and fix categoryId ---
echo ""
echo "[3/3] Atualizando imagens dos produtos para placehold.co..."

# Get fresh token (in case expired)
FULL_RESP=$(curl -s -X POST "http://localhost:8081/realms/kll-platform/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=storefront&username=admin&password=REDACTED_SEQ_PASSWORD")
TOKEN="${FULL_RESP#*\"access_token\":\"}"
TOKEN="${TOKEN%%\"*}"
AUTH="Authorization: Bearer $TOKEN"

# Get all products
PRODUCTS=$(curl -s "$API/api/v1/products")

# Count products
TOTAL=$(echo "$PRODUCTS" | grep -o '"id":"' | wc -l)
echo "  Total de produtos: $TOTAL"
echo ""

# Extract category IDs from fresh category list
CATS=$(curl -s "$API/api/v1/categories")

get_cat_id() {
  local name="$1"
  local fragment
  fragment=$(echo "$CATS" | sed 's/},{/}\n{/g' | grep "\"name\":\"$name\"")
  local id="${fragment#*\"id\":\"}"
  id="${id%%\"*}"
  echo "$id"
}

CAT_ID_SMARTPHONES=$(get_cat_id "Smartphones")
CAT_ID_NOTEBOOKS=$(get_cat_id "Notebooks")
CAT_ID_ACESSORIOS_TECH=$(get_cat_id "Acessorios Tech")
CAT_ID_WEARABLES=$(get_cat_id "Wearables")
CAT_ID_MASCULINO=$(get_cat_id "Masculino")
CAT_ID_FEMININO=$(get_cat_id "Feminino")
CAT_ID_CALCADOS=$(get_cat_id "Calcados")
CAT_ID_ACESSORIOS_MODA=$(get_cat_id "Acessorios Moda")
CAT_ID_MOVEIS=$(get_cat_id "Moveis")
CAT_ID_ILUMINACAO=$(get_cat_id "Iluminacao")
CAT_ID_COZINHA=$(get_cat_id "Cozinha")
CAT_ID_PERFUMES=$(get_cat_id "Perfumes")
CAT_ID_SKINCARE=$(get_cat_id "Skincare")
CAT_ID_MAQUIAGEM=$(get_cat_id "Maquiagem")
CAT_ID_FITNESS=$(get_cat_id "Fitness")
CAT_ID_CORRIDA=$(get_cat_id "Corrida")
CAT_ID_NATACAO=$(get_cat_id "Natacao")

# Map product names to categories and short display names
# Format: "name_pattern|category_name|category_id|display_text"
declare -a PRODUCT_MAP=(
  # Smartphones
  "iPhone 15|Smartphones|$CAT_ID_SMARTPHONES|iPhone+15+Pro"
  "Galaxy S24|Smartphones|$CAT_ID_SMARTPHONES|Galaxy+S24+Ultra"
  "Xiaomi 14|Smartphones|$CAT_ID_SMARTPHONES|Xiaomi+14+Pro"
  "Pixel 8|Smartphones|$CAT_ID_SMARTPHONES|Google+Pixel+8"
  "Motorola Edge|Smartphones|$CAT_ID_SMARTPHONES|Moto+Edge+50"
  # Notebooks
  "MacBook Pro|Notebooks|$CAT_ID_NOTEBOOKS|MacBook+Pro+14"
  "Dell XPS|Notebooks|$CAT_ID_NOTEBOOKS|Dell+XPS+15"
  "ROG Zephyrus|Notebooks|$CAT_ID_NOTEBOOKS|ASUS+ROG"
  "ThinkPad|Notebooks|$CAT_ID_NOTEBOOKS|ThinkPad+X1"
  "Galaxy Book|Notebooks|$CAT_ID_NOTEBOOKS|Galaxy+Book4"
  # Acessorios Tech
  "AirPods|Acessorios Tech|$CAT_ID_ACESSORIOS_TECH|AirPods+Pro+2"
  "Sony WH|Acessorios Tech|$CAT_ID_ACESSORIOS_TECH|Sony+WH-1000XM5"
  "MX Master|Acessorios Tech|$CAT_ID_ACESSORIOS_TECH|Logitech+MX"
  "Samsung T7|Acessorios Tech|$CAT_ID_ACESSORIOS_TECH|Samsung+T7+SSD"
  "MagSafe|Acessorios Tech|$CAT_ID_ACESSORIOS_TECH|MagSafe+Duo"
  # Wearables
  "Watch Ultra|Wearables|$CAT_ID_WEARABLES|Apple+Watch+Ultra"
  "Galaxy Watch|Wearables|$CAT_ID_WEARABLES|Galaxy+Watch6"
  "Garmin Fenix|Wearables|$CAT_ID_WEARABLES|Garmin+Fenix+7"
  "Oura Ring|Wearables|$CAT_ID_WEARABLES|Oura+Ring+3"
  "Fitbit Sense|Wearables|$CAT_ID_WEARABLES|Fitbit+Sense+2"
  # Masculino
  "Polo Ralph|Masculino|$CAT_ID_MASCULINO|Ralph+Lauren+Polo"
  "Hugo Boss|Masculino|$CAT_ID_MASCULINO|Hugo+Boss+Blazer"
  "Diesel Slim|Masculino|$CAT_ID_MASCULINO|Diesel+Jeans"
  "Lacoste|Masculino|$CAT_ID_MASCULINO|Lacoste+Pima"
  "North Face|Masculino|$CAT_ID_MASCULINO|North+Face"
  # Feminino
  "Zara Midi|Feminino|$CAT_ID_FEMININO|Zara+Cetim"
  "Michael Kors|Feminino|$CAT_ID_FEMININO|Michael+Kors"
  "Armani Exchange|Feminino|$CAT_ID_FEMININO|Armani+Blazer"
  "Le Lis Blanc|Feminino|$CAT_ID_FEMININO|Le+Lis+Blanc"
  "Trench Coat|Feminino|$CAT_ID_FEMININO|Trench+Coat"
  # Calcados
  "Jordan 1|Calcados|$CAT_ID_CALCADOS|Air+Jordan+1"
  "Ultraboost|Calcados|$CAT_ID_CALCADOS|Adidas+Ultraboost"
  "Dr. Martens|Calcados|$CAT_ID_CALCADOS|Dr.+Martens+2976"
  "Ferragamo|Calcados|$CAT_ID_CALCADOS|Ferragamo+Oxford"
  "990v6|Calcados|$CAT_ID_CALCADOS|NB+990v6"
  # Acessorios Moda
  "Tissot PRX|Acessorios Moda|$CAT_ID_ACESSORIOS_MODA|Tissot+PRX"
  "Ray-Ban|Acessorios Moda|$CAT_ID_ACESSORIOS_MODA|Ray-Ban+Aviador"
  "Montblanc|Acessorios Moda|$CAT_ID_ACESSORIOS_MODA|Montblanc"
  "Gucci GG|Acessorios Moda|$CAT_ID_ACESSORIOS_MODA|Gucci+GG"
  "Burberry|Acessorios Moda|$CAT_ID_ACESSORIOS_MODA|Burberry+Cashmere"
  # Moveis
  "Eames|Moveis|$CAT_ID_MOVEIS|Eames+Lounge"
  "Mesa de Jantar|Moveis|$CAT_ID_MOVEIS|Mesa+Jantar"
  "Sofa 3|Moveis|$CAT_ID_MOVEIS|Sofa+Linho"
  "Estante Modular|Moveis|$CAT_ID_MOVEIS|Estante+Carvalho"
  "Herman Miller|Moveis|$CAT_ID_MOVEIS|Herman+Miller"
  # Iluminacao
  "Tom Dixon|Iluminacao|$CAT_ID_ILUMINACAO|Tom+Dixon+Beat"
  "Kartell|Iluminacao|$CAT_ID_ILUMINACAO|Kartell+Bourgie"
  "Philips Hue|Iluminacao|$CAT_ID_ILUMINACAO|Philips+Hue+LED"
  "Artemide|Iluminacao|$CAT_ID_ILUMINACAO|Artemide+Tolomeo"
  "Swarovski|Iluminacao|$CAT_ID_ILUMINACAO|Lustre+Swarovski"
  # Cozinha
  "Nespresso|Cozinha|$CAT_ID_COZINHA|Nespresso+Vertuo"
  "Le Creuset|Cozinha|$CAT_ID_COZINHA|Le+Creuset"
  "Zwilling|Cozinha|$CAT_ID_COZINHA|Zwilling+Pro"
  "KitchenAid|Cozinha|$CAT_ID_COZINHA|KitchenAid"
  "Ninja Foodi|Cozinha|$CAT_ID_COZINHA|Ninja+Air+Fryer"
  # Perfumes
  "Dior Sauvage|Perfumes|$CAT_ID_PERFUMES|Dior+Sauvage"
  "Chanel N|Perfumes|$CAT_ID_PERFUMES|Chanel+N5"
  "Tom Ford Black|Perfumes|$CAT_ID_PERFUMES|Tom+Ford+Orchid"
  "Good Girl|Perfumes|$CAT_ID_PERFUMES|Good+Girl"
  "Creed Aventus|Perfumes|$CAT_ID_PERFUMES|Creed+Aventus"
  # Skincare
  "La Roche|Skincare|$CAT_ID_SKINCARE|La+Roche-Posay"
  "Neutrogena|Skincare|$CAT_ID_SKINCARE|Neutrogena+Retinol"
  "Clinique|Skincare|$CAT_ID_SKINCARE|Clinique+Moisture"
  "Isdin|Skincare|$CAT_ID_SKINCARE|Isdin+SPF50"
  "Skinceuticals|Skincare|$CAT_ID_SKINCARE|SkinCeuticals+C"
  # Maquiagem
  "Urban Decay|Maquiagem|$CAT_ID_MAQUIAGEM|Urban+Decay"
  "MAC Studio|Maquiagem|$CAT_ID_MAQUIAGEM|MAC+Studio+Fix"
  "Fenty Beauty|Maquiagem|$CAT_ID_MAQUIAGEM|Fenty+Beauty"
  "Too Faced|Maquiagem|$CAT_ID_MAQUIAGEM|Too+Faced"
  "Charlotte Tilbury|Maquiagem|$CAT_ID_MAQUIAGEM|Charlotte+Tilbury"
  # Fitness
  "Technogym|Fitness|$CAT_ID_FITNESS|Technogym+MyRun"
  "Bowflex|Fitness|$CAT_ID_FITNESS|Bowflex+Halteres"
  "Manduka|Fitness|$CAT_ID_FITNESS|Manduka+Yoga"
  "Velites|Fitness|$CAT_ID_FITNESS|Speed+Rope"
  "Kettlebell|Fitness|$CAT_ID_FITNESS|Rogue+Kettlebell"
  # Corrida
  "Vaporfly|Corrida|$CAT_ID_CORRIDA|Nike+Vaporfly+3"
  "Forerunner|Corrida|$CAT_ID_CORRIDA|Garmin+FR965"
  "Dri-FIT|Corrida|$CAT_ID_CORRIDA|Nike+Shorts"
  "Camelbak|Corrida|$CAT_ID_CORRIDA|Camelbak+Ultra"
  "Stance|Corrida|$CAT_ID_CORRIDA|Stance+Meias"
  # Natacao
  "Speedo Fastskin Pure|Natacao|$CAT_ID_NATACAO|Speedo+Oculos"
  "Arena Powerskin|Natacao|$CAT_ID_NATACAO|Arena+Powerskin"
  "Finis Alignment|Natacao|$CAT_ID_NATACAO|Finis+Prancha"
  "Fastskin3|Natacao|$CAT_ID_NATACAO|Speedo+Touca"
  "Zoomers|Natacao|$CAT_ID_NATACAO|Finis+Nadadeiras"
)

COUNT=0
FIXED=0

# Process each product
echo "$PRODUCTS" | sed 's/},{/}\n{/g' | while IFS= read -r product; do
  # Extract product ID and name
  pid="${product#*\"id\":\"}"
  pid="${pid%%\"*}"
  pname="${product#*\"name\":\"}"
  pname="${pname%%\"*}"

  if [ -z "$pid" ] || [ ${#pid} -lt 10 ]; then
    continue
  fi

  # Find matching mapping
  MATCHED=false
  for mapping in "${PRODUCT_MAP[@]}"; do
    IFS='|' read -r pattern catname catid displaytext <<< "$mapping"
    if echo "$pname" | grep -qi "$pattern"; then
      # Build placehold.co URL
      IMG_URL="https://placehold.co/400x400/1a1a2e/c9a962?text=${displaytext}"

      # Update product
      curl -s -X PUT "$API/api/v1/products/$pid" -H "$AUTH" -H "$CT" \
        -d "{\"category\":\"$catname\",\"categoryId\":\"$catid\",\"imageUrl\":\"$IMG_URL\"}" > /dev/null

      echo "  [$catname] $pname -> $displaytext"
      MATCHED=true
      break
    fi
  done

  if [ "$MATCHED" = false ]; then
    echo "  [???] Sem mapeamento: $pname ($pid)"
  fi
done

echo ""
echo "============================================"
echo "  Correcao concluida!"
echo "============================================"
