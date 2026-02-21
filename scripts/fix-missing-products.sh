#!/bin/bash
# Create the 24 missing products + delete test category
set -e

API="http://localhost:5200"

FULL_RESP=$(curl -s -X POST "http://localhost:8081/realms/kll-platform/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=storefront&username=admin&password=REDACTED_SEQ_PASSWORD")
TOKEN="${FULL_RESP#*\"access_token\":\"}"
TOKEN="${TOKEN%%\"*}"

echo "Token: ${#TOKEN} chars"
AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# Delete test category
curl -s -X DELETE "$API/api/v1/categories/fba8fffe-906d-4907-b9f3-17f0d43aaa09" -H "$AUTH" > /dev/null 2>&1
echo "TestCatXYZ removida"

# Category IDs
SUB_SMARTPHONES="e30c3067-daeb-43d3-a585-eaf911c685b2"
SUB_NOTEBOOKS="2e9b9986-2df1-4c0f-8e11-7e73027fb8a3"
SUB_ACESSORIOS="287b6be4-dd2f-4f27-934b-f577c481fd32"
SUB_WEARABLES="8acd31b4-abad-4c68-ae98-752686c30539"
SUB_MASCULINO="8d6dcbe0-6eee-4757-9a77-ae0712a67264"
SUB_ACESSORIOS_MODA="0884777d-7ca5-41bf-b983-775eb4323c26"
SUB_PERFUMES="2d2e1f2b-d136-44a5-b6dc-5b3dc31cdfe4"
SUB_NATACAO="a9c1a080-571b-4319-8e26-09a08b53a094"

IMG="https://placehold.co/400x400/1a1a2e/c9a962?text="

p() {
  curl -s -X POST "$API/api/v1/products" -H "$AUTH" -H "$CT" -d "$1" > /dev/null
  echo "  Criado: $2"
}

echo ""
echo "=== Smartphones (4 faltantes) ==="

p "{\"name\":\"Samsung Galaxy S24 Ultra\",\"description\":\"Flagship da Samsung com S Pen integrada, processador Snapdragon 8 Gen 3, camera de 200MP e tela Dynamic AMOLED 2X de 6.8 polegadas com Galaxy AI.\",\"price\":8999.00,\"stockQuantity\":30,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"${IMG}Galaxy+S24+Ultra\"}" "Galaxy S24 Ultra"

p "{\"name\":\"Xiaomi 14 Pro 512GB\",\"description\":\"Smartphone premium com lentes Leica, Snapdragon 8 Gen 3, tela LTPO AMOLED de 6.73 polegadas e carregamento rapido de 120W. Corpo em ceramica.\",\"price\":5299.00,\"stockQuantity\":40,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"${IMG}Xiaomi+14+Pro\"}" "Xiaomi 14 Pro"

p "{\"name\":\"Google Pixel 8 Pro\",\"description\":\"Experiencia pura do Android com chip Tensor G3, camera com IA avancada e 7 anos de atualizacoes. Tela LTPO OLED de 6.7 polegadas a 120Hz.\",\"price\":6499.00,\"stockQuantity\":20,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"${IMG}Google+Pixel+8\"}" "Pixel 8 Pro"

p "{\"name\":\"Motorola Edge 50 Ultra\",\"description\":\"Design sofisticado com acabamento em madeira ou couro, camera de 50MP com OIS, Snapdragon 8s Gen 3 e tela pOLED de 6.7 polegadas.\",\"price\":4599.00,\"stockQuantity\":35,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"${IMG}Moto+Edge+50\"}" "Motorola Edge 50"

echo ""
echo "=== Notebooks (5 faltantes) ==="

p "{\"name\":\"MacBook Pro 14 M3 Pro\",\"description\":\"Notebook profissional da Apple com chip M3 Pro, 18GB de memoria unificada, tela Liquid Retina XDR de 14.2 polegadas e ate 17 horas de bateria.\",\"price\":18999.00,\"stockQuantity\":15,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"${IMG}MacBook+Pro+14\"}" "MacBook Pro 14"

p "{\"name\":\"Dell XPS 15 Intel Core Ultra 7\",\"description\":\"Ultrabook premium com tela OLED 3.5K de 15.6 polegadas, 32GB RAM, SSD de 1TB e design ultrafino em aluminio com borda InfinityEdge.\",\"price\":14999.00,\"stockQuantity\":12,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"${IMG}Dell+XPS+15\"}" "Dell XPS 15"

p "{\"name\":\"ASUS ROG Zephyrus G16 RTX 4070\",\"description\":\"Notebook gamer ultrafino com Intel Core i9-14900H, RTX 4070, 16GB DDR5, tela Nebula OLED de 16 polegadas a 240Hz e chassis em aluminio.\",\"price\":16499.00,\"stockQuantity\":10,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"${IMG}ASUS+ROG\"}" "ASUS ROG Zephyrus"

p "{\"name\":\"Lenovo ThinkPad X1 Carbon Gen 11\",\"description\":\"Notebook corporativo premium com Intel Core i7-1365U, 16GB RAM, tela IPS 2.8K de 14 polegadas, certificacao MIL-STD e apenas 1.12kg.\",\"price\":12999.00,\"stockQuantity\":18,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"${IMG}ThinkPad+X1\"}" "ThinkPad X1 Carbon"

p "{\"name\":\"Samsung Galaxy Book4 Ultra\",\"description\":\"Notebook com Intel Core Ultra 9, RTX 4070, tela Dynamic AMOLED 2X de 16 polegadas 3K, 32GB RAM e Galaxy AI integrado.\",\"price\":17499.00,\"stockQuantity\":8,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"${IMG}Galaxy+Book4\"}" "Galaxy Book4 Ultra"

echo ""
echo "=== Acessorios Tech (5 faltantes) ==="

p "{\"name\":\"AirPods Pro 2 USB-C\",\"description\":\"Fones intra-auriculares da Apple com cancelamento ativo de ruido adaptativo, audio espacial personalizado, chip H2 e ate 6 horas de bateria.\",\"price\":1899.00,\"stockQuantity\":60,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS\",\"imageUrl\":\"${IMG}AirPods+Pro+2\"}" "AirPods Pro 2"

p "{\"name\":\"Sony WH-1000XM5\",\"description\":\"Headphone over-ear premium com cancelamento de ruido lider do mercado, driver de 30mm, ate 30 horas de bateria e design dobravel ultraleve.\",\"price\":2299.00,\"stockQuantity\":35,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS\",\"imageUrl\":\"${IMG}Sony+WH-1000XM5\"}" "Sony WH-1000XM5"

p "{\"name\":\"Logitech MX Master 3S\",\"description\":\"Mouse ergonomico premium com sensor de 8000 DPI, scroll MagSpeed, conexao em ate 3 dispositivos via Bluetooth e USB-C recarregavel.\",\"price\":649.00,\"stockQuantity\":80,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS\",\"imageUrl\":\"${IMG}Logitech+MX\"}" "Logitech MX Master 3S"

p "{\"name\":\"Samsung T7 Shield SSD 2TB\",\"description\":\"SSD portatil com protecao IP65 contra agua e poeira, velocidades de ate 1.050MB/s, criptografia AES 256-bit e design compacto resistente.\",\"price\":1199.00,\"stockQuantity\":45,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS\",\"imageUrl\":\"${IMG}Samsung+T7+SSD\"}" "Samsung T7 Shield"

p "{\"name\":\"Carregador Apple MagSafe Duo\",\"description\":\"Carregador sem fio duplo da Apple para iPhone e Apple Watch simultaneamente, design dobravel em couro premium e carregamento de ate 15W.\",\"price\":1099.00,\"stockQuantity\":50,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS\",\"imageUrl\":\"${IMG}MagSafe+Duo\"}" "MagSafe Duo"

echo ""
echo "=== Wearables (5 faltantes) ==="

p "{\"name\":\"Apple Watch Ultra 2\",\"description\":\"Relogio inteligente mais robusto da Apple com caixa de 49mm em titanio, GPS de dupla frequencia, ate 36 horas de bateria e tela de 3000 nits.\",\"price\":9299.00,\"stockQuantity\":15,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"${IMG}Apple+Watch+Ultra\"}" "Apple Watch Ultra 2"

p "{\"name\":\"Samsung Galaxy Watch6 Classic\",\"description\":\"Smartwatch premium com bisel rotativo, sensor BioActive, monitoramento de sono avancado, GPS integrado e tela Super AMOLED de 1.47 polegadas.\",\"price\":3499.00,\"stockQuantity\":25,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"${IMG}Galaxy+Watch6\"}" "Galaxy Watch6 Classic"

p "{\"name\":\"Garmin Fenix 7X Solar\",\"description\":\"Relogio multiesporte premium com carregamento solar, mapas TopoActive, ate 37 dias de bateria, oximetro de pulso e caixa em titanio DLC.\",\"price\":7999.00,\"stockQuantity\":10,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"${IMG}Garmin+Fenix+7\"}" "Garmin Fenix 7X"

p "{\"name\":\"Oura Ring Generation 3\",\"description\":\"Anel inteligente de titanio com monitoramento de sono, frequencia cardiaca, temperatura corporal e SpO2. Design discreto com ate 7 dias de bateria.\",\"price\":2499.00,\"stockQuantity\":20,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"${IMG}Oura+Ring+3\"}" "Oura Ring 3"

p "{\"name\":\"Fitbit Sense 2\",\"description\":\"Smartwatch focado em saude com sensor de estresse cEDA, ECG integrado, GPS, monitoramento continuo de SpO2 e tela AMOLED always-on.\",\"price\":1999.00,\"stockQuantity\":30,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"${IMG}Fitbit+Sense+2\"}" "Fitbit Sense 2"

echo ""
echo "=== Masculino (1 faltante) ==="

p "{\"name\":\"Camiseta Lacoste Pima Cotton\",\"description\":\"Camiseta em algodao pima peruano ultra macio com gola careca reforcada, corte regular e icone do jacare bordado no peito esquerdo.\",\"price\":399.00,\"stockQuantity\":70,\"category\":\"Masculino\",\"categoryId\":\"$SUB_MASCULINO\",\"imageUrl\":\"${IMG}Lacoste+Pima\"}" "Lacoste Pima Cotton"

echo ""
echo "=== Acessorios Moda (2 faltantes) ==="

p "{\"name\":\"Cinto Gucci GG Marmont\",\"description\":\"Cinto em couro granulado preto com fivela GG entrelacada em metal envelhecido, acabamento premium e largura de 4cm, icone da maison italiana.\",\"price\":2899.00,\"stockQuantity\":18,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"${IMG}Gucci+GG\"}" "Gucci GG Marmont"

p "{\"name\":\"Cachecol Burberry Cashmere Check\",\"description\":\"Cachecol classico em cashmere puro com o iconico padrao xadrez Burberry, franjas nas pontas, toque ultra macio e dimensoes generosas de 168x30cm.\",\"price\":3999.00,\"stockQuantity\":10,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"${IMG}Burberry+Cashmere\"}" "Burberry Cashmere"

echo ""
echo "=== Perfumes (1 faltante) ==="

p "{\"name\":\"Carolina Herrera Good Girl EDP 80ml\",\"description\":\"Perfume feminino em iconico frasco de sapato stiletto com notas de jasmin sambac, cacau, tonka e tuberosa. Elegante e sedutor.\",\"price\":599.00,\"stockQuantity\":40,\"category\":\"Perfumes\",\"categoryId\":\"$SUB_PERFUMES\",\"imageUrl\":\"${IMG}Good+Girl\"}" "Good Girl"

echo ""
echo "=== Natacao (1 faltante) ==="

p "{\"name\":\"Oculos de Natacao Speedo Fastskin Pure Focus\",\"description\":\"Oculos de competicao com lentes curvadas IQfit anti-embacante, vedacao ultrafina em silicone, ponte nasal ajustavel e campo de visao ampliado.\",\"price\":499.00,\"stockQuantity\":35,\"category\":\"Natacao\",\"categoryId\":\"$SUB_NATACAO\",\"imageUrl\":\"${IMG}Speedo+Oculos\"}" "Speedo Fastskin"

echo ""
echo "=== Verificacao final ==="
TOTAL=$(curl -s "$API/api/v1/products" | grep -o '"id":"' | wc -l)
echo "Total de produtos: $TOTAL"
TOTAL_CATS=$(curl -s "$API/api/v1/categories" | grep -o '"id":"' | wc -l)
echo "Total de categorias: $TOTAL_CATS"
