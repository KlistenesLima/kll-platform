#!/bin/bash
# =============================================================================
# Update all product images to real Unsplash photos
# =============================================================================
set -e

API="http://localhost:5200"

# --- Auth ---
echo "[1/3] Autenticando..."
FULL_RESP=$(curl -s -X POST "http://localhost:8081/realms/kll-platform/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=storefront&username=admin&password=REDACTED_SEQ_PASSWORD")
TOKEN="${FULL_RESP#*\"access_token\":\"}"
TOKEN="${TOKEN%%\"*}"

if [ ${#TOKEN} -lt 100 ]; then
  echo "ERRO: Token invalido (${#TOKEN} chars)"
  exit 1
fi
echo "  Token OK (${#TOKEN} chars)"

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# --- Unsplash image mapping ---
# Format: "name_pattern|unsplash_url"
# Patterns are matched case-insensitively against product names

declare -a IMG_MAP=(
  # SMARTPHONES
  "iPhone|https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"
  "Galaxy S24|https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"
  "Xiaomi|https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop"
  "Pixel 8|https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop"
  "Motorola|https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop"

  # NOTEBOOKS
  "MacBook|https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"
  "Dell XPS|https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop"
  "ROG Zephyrus|https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop"
  "ThinkPad|https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop"
  "Galaxy Book|https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop"

  # WEARABLES
  "Watch Ultra|https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=400&fit=crop"
  "Galaxy Watch|https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop"
  "Garmin|https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop"
  "Oura Ring|https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop"
  "Fitbit|https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop"

  # ACESSORIOS TECH
  "AirPods|https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop"
  "Sony WH|https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400&h=400&fit=crop"
  "MX Master|https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop"
  "Samsung T7|https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=400&fit=crop"
  "MagSafe|https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"

  # MODA MASCULINO
  "Polo Ralph|https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
  "Hugo Boss|https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"
  "Diesel|https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
  "Lacoste|https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
  "North Face|https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"

  # MODA FEMININO
  "Zara|https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop"
  "Michael Kors|https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop"
  "Armani|https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop"
  "Le Lis|https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop"
  "Trench Coat|https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"

  # CALCADOS
  "Jordan|https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
  "Ultraboost|https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=400&fit=crop"
  "Dr. Martens|https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
  "Ferragamo|https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
  "990v6|https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400&h=400&fit=crop"

  # ACESSORIOS MODA
  "Tissot|https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop"
  "Ray-Ban|https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"
  "Montblanc|https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop"
  "Gucci|https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop"
  "Burberry|https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop"

  # MOVEIS
  "Eames|https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop"
  "Mesa de Jantar|https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop"
  "Sofa|https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop"
  "Estante|https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop"
  "Herman Miller|https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop"

  # ILUMINACAO
  "Tom Dixon|https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop"
  "Kartell|https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop"
  "Philips Hue|https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop"
  "Artemide|https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop"
  "Swarovski|https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop"

  # COZINHA
  "Nespresso|https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
  "Le Creuset|https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
  "Zwilling|https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
  "KitchenAid|https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"
  "Ninja|https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"

  # PERFUMES
  "Dior Sauvage|https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"
  "Chanel|https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"
  "Tom Ford|https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"
  "Good Girl|https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"
  "Creed|https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop"

  # SKINCARE
  "La Roche|https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"
  "Neutrogena|https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"
  "Clinique|https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"
  "Isdin|https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"
  "Skinceuticals|https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop"

  # MAQUIAGEM
  "Urban Decay|https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop"
  "MAC Studio|https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop"
  "Fenty|https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop"
  "Too Faced|https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop"
  "Charlotte Tilbury|https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop"

  # FITNESS
  "Technogym|https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=400&fit=crop"
  "Bowflex|https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop"
  "Manduka|https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=400&fit=crop"
  "Velites|https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop"
  "Kettlebell|https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop"

  # CORRIDA
  "Vaporfly|https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop"
  "Forerunner|https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop"
  "Dri-FIT|https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop"
  "Camelbak|https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop"
  "Stance|https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop"

  # NATACAO
  "Speedo|https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop"
  "Arena Powerskin|https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop"
  "Finis|https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop"
  "Zoomers|https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop"
)

# --- Fetch all products ---
echo ""
echo "[2/3] Buscando todos os produtos..."
PRODUCTS=$(curl -s "$API/api/v1/products")
TOTAL=$(echo "$PRODUCTS" | grep -o '"id":"' | wc -l)
echo "  Total de produtos encontrados: $TOTAL"

# --- Update each product ---
echo ""
echo "[3/3] Atualizando imagens..."
UPDATED=0
SKIPPED=0

echo "$PRODUCTS" | sed 's/},{/}\n{/g' | while IFS= read -r product; do
  # Extract product ID and name
  pid="${product#*\"id\":\"}"
  pid="${pid%%\"*}"
  pname="${product#*\"name\":\"}"
  pname="${pname%%\"*}"

  if [ -z "$pid" ] || [ ${#pid} -lt 10 ]; then
    continue
  fi

  # Find matching image URL
  MATCHED=false
  for mapping in "${IMG_MAP[@]}"; do
    IFS='|' read -r pattern imgurl <<< "$mapping"
    if echo "$pname" | grep -qi "$pattern"; then
      # Update product image
      curl -s -X PUT "$API/api/v1/products/$pid" -H "$AUTH" -H "$CT" \
        -d "{\"imageUrl\":\"$imgurl\"}" > /dev/null

      echo "  OK: $pname"
      MATCHED=true
      UPDATED=$((UPDATED + 1))
      break
    fi
  done

  if [ "$MATCHED" = false ]; then
    echo "  SKIP: $pname (sem mapeamento)"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo "============================================"
echo "  Atualizacao concluida!"
echo "  Verifique em: http://localhost:5174"
echo "============================================"
