#!/bin/bash
# =============================================================================
# KLL Store - Script de Seed
# Popular banco com categorias, subcategorias e ~60 produtos realistas
# =============================================================================

set -e

API="http://localhost:5200"
KEYCLOAK="http://localhost:8081/realms/kll-platform/protocol/openid-connect/token"

echo "============================================"
echo "  KLL Store - Seed de Dados"
echo "============================================"
echo ""

# --- Obter token admin ---
echo "[1/4] Autenticando no Keycloak..."
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=storefront" \
  -d "username=admin" \
  -d "password=Admin123!")

TOKEN="${TOKEN_RESPONSE#*\"access_token\":\"}"
TOKEN="${TOKEN%%\"*}"

if [ ${#TOKEN} -lt 100 ]; then
  echo "ERRO: Falha na autenticacao. Resposta:"
  echo "${TOKEN_RESPONSE:0:300}"
  exit 1
fi
echo "  Token obtido com sucesso!"
echo ""

AUTH="Authorization: Bearer $TOKEN"
CT="Content-Type: application/json"

# Helper: criar categoria e retornar ID
create_category() {
  local json="$1"
  local resp
  resp=$(curl -s -X POST "$API/api/v1/categories" -H "$AUTH" -H "$CT" -d "$json")
  local id="${resp#*\"id\":\"}"
  id="${id%%\"*}"
  echo "$id"
}

# Helper: criar produto
create_product() {
  local json="$1"
  curl -s -X POST "$API/api/v1/products" -H "$AUTH" -H "$CT" -d "$json" > /dev/null
}

# =============================================================================
# CATEGORIAS PAI
# =============================================================================
echo "[2/4] Criando categorias pai..."

CAT_ELETRONICOS=$(create_category '{"name":"Eletronicos","description":"Tecnologia de ponta e gadgets premium","imageUrl":"https://picsum.photos/seed/eletronicos/400"}')
echo "  Eletronicos: $CAT_ELETRONICOS"

CAT_MODA=$(create_category '{"name":"Moda","description":"Moda premium e alta costura","imageUrl":"https://picsum.photos/seed/moda/400"}')
echo "  Moda: $CAT_MODA"

CAT_CASA=$(create_category '{"name":"Casa e Decoracao","description":"Design de interiores e itens para o lar","imageUrl":"https://picsum.photos/seed/casa/400"}')
echo "  Casa e Decoracao: $CAT_CASA"

CAT_BELEZA=$(create_category '{"name":"Beleza e Perfumaria","description":"Cosmeticos e fragancias de luxo","imageUrl":"https://picsum.photos/seed/beleza/400"}')
echo "  Beleza e Perfumaria: $CAT_BELEZA"

CAT_ESPORTES=$(create_category '{"name":"Esportes","description":"Equipamentos e roupas esportivas de alta performance","imageUrl":"https://picsum.photos/seed/esportes/400"}')
echo "  Esportes: $CAT_ESPORTES"

echo ""

# =============================================================================
# SUBCATEGORIAS
# =============================================================================
echo "[3/4] Criando subcategorias..."

# Eletronicos
SUB_SMARTPHONES=$(create_category "{\"name\":\"Smartphones\",\"description\":\"Celulares de ultima geracao\",\"parentCategoryId\":\"$CAT_ELETRONICOS\"}")
echo "  Smartphones: $SUB_SMARTPHONES"

SUB_NOTEBOOKS=$(create_category "{\"name\":\"Notebooks\",\"description\":\"Notebooks e laptops profissionais\",\"parentCategoryId\":\"$CAT_ELETRONICOS\"}")
echo "  Notebooks: $SUB_NOTEBOOKS"

SUB_ACESSORIOS_TECH=$(create_category "{\"name\":\"Acessorios Tech\",\"description\":\"Perifericos e acessorios tecnologicos\",\"parentCategoryId\":\"$CAT_ELETRONICOS\"}")
echo "  Acessorios Tech: $SUB_ACESSORIOS_TECH"

SUB_WEARABLES=$(create_category "{\"name\":\"Wearables\",\"description\":\"Relogios e dispositivos vestiveis inteligentes\",\"parentCategoryId\":\"$CAT_ELETRONICOS\"}")
echo "  Wearables: $SUB_WEARABLES"

# Moda
SUB_MASCULINO=$(create_category "{\"name\":\"Masculino\",\"description\":\"Moda masculina premium\",\"parentCategoryId\":\"$CAT_MODA\"}")
echo "  Masculino: $SUB_MASCULINO"

SUB_FEMININO=$(create_category "{\"name\":\"Feminino\",\"description\":\"Moda feminina e alta costura\",\"parentCategoryId\":\"$CAT_MODA\"}")
echo "  Feminino: $SUB_FEMININO"

SUB_CALCADOS=$(create_category "{\"name\":\"Calcados\",\"description\":\"Sapatos, tenis e botas premium\",\"parentCategoryId\":\"$CAT_MODA\"}")
echo "  Calcados: $SUB_CALCADOS"

SUB_ACESSORIOS_MODA=$(create_category "{\"name\":\"Acessorios Moda\",\"description\":\"Bolsas, relogios e joias\",\"parentCategoryId\":\"$CAT_MODA\"}")
echo "  Acessorios Moda: $SUB_ACESSORIOS_MODA"

# Casa & Decoracao
SUB_MOVEIS=$(create_category "{\"name\":\"Moveis\",\"description\":\"Moveis de design exclusivo\",\"parentCategoryId\":\"$CAT_CASA\"}")
echo "  Moveis: $SUB_MOVEIS"

SUB_ILUMINACAO=$(create_category "{\"name\":\"Iluminacao\",\"description\":\"Luminarias e sistemas de iluminacao\",\"parentCategoryId\":\"$CAT_CASA\"}")
echo "  Iluminacao: $SUB_ILUMINACAO"

SUB_COZINHA=$(create_category "{\"name\":\"Cozinha\",\"description\":\"Utensilios e eletrodomesticos gourmet\",\"parentCategoryId\":\"$CAT_CASA\"}")
echo "  Cozinha: $SUB_COZINHA"

# Beleza & Perfumaria
SUB_PERFUMES=$(create_category "{\"name\":\"Perfumes\",\"description\":\"Fragancias importadas e nacionais\",\"parentCategoryId\":\"$CAT_BELEZA\"}")
echo "  Perfumes: $SUB_PERFUMES"

SUB_SKINCARE=$(create_category "{\"name\":\"Skincare\",\"description\":\"Cuidados com a pele de alta performance\",\"parentCategoryId\":\"$CAT_BELEZA\"}")
echo "  Skincare: $SUB_SKINCARE"

SUB_MAQUIAGEM=$(create_category "{\"name\":\"Maquiagem\",\"description\":\"Maquiagem profissional e premium\",\"parentCategoryId\":\"$CAT_BELEZA\"}")
echo "  Maquiagem: $SUB_MAQUIAGEM"

# Esportes
SUB_FITNESS=$(create_category "{\"name\":\"Fitness\",\"description\":\"Equipamentos para academia e treino\",\"parentCategoryId\":\"$CAT_ESPORTES\"}")
echo "  Fitness: $SUB_FITNESS"

SUB_CORRIDA=$(create_category "{\"name\":\"Corrida\",\"description\":\"Tenis e equipamentos para corrida\",\"parentCategoryId\":\"$CAT_ESPORTES\"}")
echo "  Corrida: $SUB_CORRIDA"

SUB_NATACAO=$(create_category "{\"name\":\"Natacao\",\"description\":\"Equipamentos e acessorios para natacao\",\"parentCategoryId\":\"$CAT_ESPORTES\"}")
echo "  Natacao: $SUB_NATACAO"

echo ""

# =============================================================================
# PRODUTOS
# =============================================================================
echo "[4/4] Criando produtos (~60)..."
COUNT=0

# --- SMARTPHONES ---
create_product "{\"name\":\"iPhone 15 Pro Max 256GB\",\"description\":\"O iPhone mais avancado da Apple com chip A17 Pro, camera de 48MP com zoom optico 5x e tela Super Retina XDR de 6.7 polegadas. Corpo em titanio com design premium.\",\"price\":9499.00,\"stockQuantity\":25,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"https://picsum.photos/seed/iphone15pro/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Samsung Galaxy S24 Ultra\",\"description\":\"Flagship da Samsung com S Pen integrada, processador Snapdragon 8 Gen 3, camera de 200MP e tela Dynamic AMOLED 2X de 6.8 polegadas com Galaxy AI.\",\"price\":8999.00,\"stockQuantity\":30,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"https://picsum.photos/seed/galaxys24/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Xiaomi 14 Pro 512GB\",\"description\":\"Smartphone premium com lentes Leica, Snapdragon 8 Gen 3, tela LTPO AMOLED de 6.73 polegadas e carregamento rapido de 120W. Corpo em ceramica.\",\"price\":5299.00,\"stockQuantity\":40,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"https://picsum.photos/seed/xiaomi14/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Google Pixel 8 Pro\",\"description\":\"Experiencia pura do Android com chip Tensor G3, camera com IA avancada e 7 anos de atualizacoes. Tela LTPO OLED de 6.7 polegadas a 120Hz.\",\"price\":6499.00,\"stockQuantity\":20,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"https://picsum.photos/seed/pixel8pro/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Motorola Edge 50 Ultra\",\"description\":\"Design sofisticado com acabamento em madeira ou couro, camera de 50MP com OIS, Snapdragon 8s Gen 3 e tela pOLED de 6.7 polegadas.\",\"price\":4599.00,\"stockQuantity\":35,\"category\":\"Smartphones\",\"categoryId\":\"$SUB_SMARTPHONES\",\"imageUrl\":\"https://picsum.photos/seed/motoedge50/400\"}"
COUNT=$((COUNT+1))
echo "  Smartphones: 5 produtos"

# --- NOTEBOOKS ---
create_product "{\"name\":\"MacBook Pro 14 M3 Pro\",\"description\":\"Notebook profissional da Apple com chip M3 Pro, 18GB de memoria unificada, tela Liquid Retina XDR de 14.2 polegadas e ate 17 horas de bateria.\",\"price\":18999.00,\"stockQuantity\":15,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"https://picsum.photos/seed/macbookpro14/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Dell XPS 15 Intel Core Ultra 7\",\"description\":\"Ultrabook premium com tela OLED 3.5K de 15.6 polegadas, 32GB RAM, SSD de 1TB e design ultrafino em aluminio com borda InfinityEdge.\",\"price\":14999.00,\"stockQuantity\":12,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"https://picsum.photos/seed/dellxps15/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"ASUS ROG Zephyrus G16 RTX 4070\",\"description\":\"Notebook gamer ultrafino com Intel Core i9-14900H, RTX 4070, 16GB DDR5, tela Nebula OLED de 16 polegadas a 240Hz e chassis em aluminio.\",\"price\":16499.00,\"stockQuantity\":10,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"https://picsum.photos/seed/rogzephyrus/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Lenovo ThinkPad X1 Carbon Gen 11\",\"description\":\"Notebook corporativo premium com Intel Core i7-1365U, 16GB RAM, tela IPS 2.8K de 14 polegadas, certificacao MIL-STD e apenas 1.12kg.\",\"price\":12999.00,\"stockQuantity\":18,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"https://picsum.photos/seed/thinkpadx1/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Samsung Galaxy Book4 Ultra\",\"description\":\"Notebook com Intel Core Ultra 9, RTX 4070, tela Dynamic AMOLED 2X de 16 polegadas 3K, 32GB RAM e Galaxy AI integrado.\",\"price\":17499.00,\"stockQuantity\":8,\"category\":\"Notebooks\",\"categoryId\":\"$SUB_NOTEBOOKS\",\"imageUrl\":\"https://picsum.photos/seed/galaxybook4/400\"}"
COUNT=$((COUNT+1))
echo "  Notebooks: 5 produtos"

# --- ACESSORIOS TECH ---
create_product "{\"name\":\"AirPods Pro 2 USB-C\",\"description\":\"Fones intra-auriculares da Apple com cancelamento ativo de ruido adaptativo, audio espacial personalizado, chip H2 e ate 6 horas de bateria.\",\"price\":1899.00,\"stockQuantity\":60,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS_TECH\",\"imageUrl\":\"https://picsum.photos/seed/airpodspro2/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Sony WH-1000XM5\",\"description\":\"Headphone over-ear premium com cancelamento de ruido lider do mercado, driver de 30mm, ate 30 horas de bateria e design dobravel ultraleve.\",\"price\":2299.00,\"stockQuantity\":35,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS_TECH\",\"imageUrl\":\"https://picsum.photos/seed/sonywh1000/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Logitech MX Master 3S\",\"description\":\"Mouse ergonomico premium com sensor de 8000 DPI, scroll MagSpeed, conexao em ate 3 dispositivos via Bluetooth e USB-C recarregavel.\",\"price\":649.00,\"stockQuantity\":80,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS_TECH\",\"imageUrl\":\"https://picsum.photos/seed/mxmaster3s/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Samsung T7 Shield SSD 2TB\",\"description\":\"SSD portatil com protecao IP65 contra agua e poeira, velocidades de ate 1.050MB/s, criptografia AES 256-bit e design compacto resistente.\",\"price\":1199.00,\"stockQuantity\":45,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS_TECH\",\"imageUrl\":\"https://picsum.photos/seed/samsungt7/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Carregador Apple MagSafe Duo\",\"description\":\"Carregador sem fio duplo da Apple para iPhone e Apple Watch simultaneamente, design dobravel em couro premium e carregamento de ate 15W.\",\"price\":1099.00,\"stockQuantity\":50,\"category\":\"Acessorios Tech\",\"categoryId\":\"$SUB_ACESSORIOS_TECH\",\"imageUrl\":\"https://picsum.photos/seed/magsafeduo/400\"}"
COUNT=$((COUNT+1))
echo "  Acessorios Tech: 5 produtos"

# --- WEARABLES ---
create_product "{\"name\":\"Apple Watch Ultra 2\",\"description\":\"Relogio inteligente mais robusto da Apple com caixa de 49mm em titanio, GPS de dupla frequencia, ate 36 horas de bateria e tela de 3000 nits.\",\"price\":9299.00,\"stockQuantity\":15,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"https://picsum.photos/seed/watchultra2/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Samsung Galaxy Watch6 Classic\",\"description\":\"Smartwatch premium com bisel rotativo, sensor BioActive, monitoramento de sono avancado, GPS integrado e tela Super AMOLED de 1.47 polegadas.\",\"price\":3499.00,\"stockQuantity\":25,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"https://picsum.photos/seed/galaxywatch6/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Garmin Fenix 7X Solar\",\"description\":\"Relogio multiesporte premium com carregamento solar, mapas TopoActive, ate 37 dias de bateria, oximetro de pulso e caixa em titanio DLC.\",\"price\":7999.00,\"stockQuantity\":10,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"https://picsum.photos/seed/garminfenix7/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Oura Ring Generation 3\",\"description\":\"Anel inteligente de titanio com monitoramento de sono, frequencia cardiaca, temperatura corporal e SpO2. Design discreto com ate 7 dias de bateria.\",\"price\":2499.00,\"stockQuantity\":20,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"https://picsum.photos/seed/ouraring3/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Fitbit Sense 2\",\"description\":\"Smartwatch focado em saude com sensor de estresse cEDA, ECG integrado, GPS, monitoramento continuo de SpO2 e tela AMOLED always-on.\",\"price\":1999.00,\"stockQuantity\":30,\"category\":\"Wearables\",\"categoryId\":\"$SUB_WEARABLES\",\"imageUrl\":\"https://picsum.photos/seed/fitbitsense2/400\"}"
COUNT=$((COUNT+1))
echo "  Wearables: 5 produtos"

# --- MASCULINO ---
create_product "{\"name\":\"Polo Ralph Lauren Classic Fit\",\"description\":\"Camisa polo iconica em algodao pima premium com bordado do cavaleiro no peito. Corte classico, gola de malha canelada e abertura com dois botoes.\",\"price\":599.00,\"stockQuantity\":50,\"category\":\"Masculino\",\"categoryId\":\"$SUB_MASCULINO\",\"imageUrl\":\"https://picsum.photos/seed/poloralph/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Blazer Hugo Boss Slim Fit La\",\"description\":\"Blazer em la italiana super 120s com forro acetinado, corte slim fit moderno, bolsos com lapela e acabamento premium costurado a mao.\",\"price\":2899.00,\"stockQuantity\":15,\"category\":\"Masculino\",\"categoryId\":\"$SUB_MASCULINO\",\"imageUrl\":\"https://picsum.photos/seed/hugoboss/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Calca Jeans Diesel Slim Taper\",\"description\":\"Jeans premium em denim japones com lavagem vintage, corte slim taper, costuras rebitadas e etiqueta metalica iconica da Diesel.\",\"price\":1299.00,\"stockQuantity\":30,\"category\":\"Masculino\",\"categoryId\":\"$SUB_MASCULINO\",\"imageUrl\":\"https://picsum.photos/seed/dieseljeans/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Camiseta Lacoste Pima Cotton\",\"description\":\"Camiseta em algodao pima peruano ultra macio com gola careca reforçada, corte regular e icone do jacare bordado no peito esquerdo.\",\"price\":399.00,\"stockQuantity\":70,\"category\":\"Masculino\",\"categoryId\":\"$SUB_MASCULINO\",\"imageUrl\":\"https://picsum.photos/seed/lacoste/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Jaqueta North Face Thermoball Eco\",\"description\":\"Jaqueta com isolamento termico ThermoBall feito de materiais reciclados, resistente a agua DWR, capuz ajustavel e design compactavel para viagens.\",\"price\":1599.00,\"stockQuantity\":20,\"category\":\"Masculino\",\"categoryId\":\"$SUB_MASCULINO\",\"imageUrl\":\"https://picsum.photos/seed/northface/400\"}"
COUNT=$((COUNT+1))
echo "  Masculino: 5 produtos"

# --- FEMININO ---
create_product "{\"name\":\"Vestido Zara Midi Cetim\",\"description\":\"Vestido midi em cetim com corte enviesado que valoriza a silhueta, decote V elegante, mangas bufantes e cinto removivel na cintura.\",\"price\":499.00,\"stockQuantity\":35,\"category\":\"Feminino\",\"categoryId\":\"$SUB_FEMININO\",\"imageUrl\":\"https://picsum.photos/seed/zaravestido/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Bolsa Michael Kors Jet Set Medium\",\"description\":\"Bolsa tote em couro saffiano com forro de logotipo MK, compartimento central com ziper, alca de ombro ajustavel e detalhes em hardware dourado.\",\"price\":1899.00,\"stockQuantity\":20,\"category\":\"Feminino\",\"categoryId\":\"$SUB_FEMININO\",\"imageUrl\":\"https://picsum.photos/seed/michaelkors/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Blazer Feminino Armani Exchange\",\"description\":\"Blazer estruturado em tecido crepe com forro interno, corte reto contemporaneo, abotoamento simples e bolsos laterais com aba.\",\"price\":2199.00,\"stockQuantity\":18,\"category\":\"Feminino\",\"categoryId\":\"$SUB_FEMININO\",\"imageUrl\":\"https://picsum.photos/seed/armaniblazer/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Saia Midi Plissada Le Lis Blanc\",\"description\":\"Saia midi plissada em chiffon com cintura elastica confortavel, caimento fluido e elegante, perfeita para looks de trabalho e eventos sociais.\",\"price\":799.00,\"stockQuantity\":25,\"category\":\"Feminino\",\"categoryId\":\"$SUB_FEMININO\",\"imageUrl\":\"https://picsum.photos/seed/lelisblanc/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Casaco Trench Coat Burberry Inspired\",\"description\":\"Trench coat classico em gabardine impermeavel com forro xadrez, cinto com fivela, abotoamento duplo e comprimento midi atemporal.\",\"price\":3499.00,\"stockQuantity\":10,\"category\":\"Feminino\",\"categoryId\":\"$SUB_FEMININO\",\"imageUrl\":\"https://picsum.photos/seed/trenchcoat/400\"}"
COUNT=$((COUNT+1))
echo "  Feminino: 5 produtos"

# --- CALCADOS ---
create_product "{\"name\":\"Nike Air Jordan 1 Retro High OG\",\"description\":\"Icone do streetwear e do basquete com cabedal em couro premium, entressola Air encapsulado, colarinho acolchoado e sola de borracha duravel.\",\"price\":1299.00,\"stockQuantity\":40,\"category\":\"Calcados\",\"categoryId\":\"$SUB_CALCADOS\",\"imageUrl\":\"https://picsum.photos/seed/jordan1retro/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Adidas Ultraboost 23\",\"description\":\"Tenis de corrida e lifestyle com entressola Boost que retorna energia a cada passo, cabedal Primeknit adaptavel e solado Continental de borracha.\",\"price\":999.00,\"stockQuantity\":55,\"category\":\"Calcados\",\"categoryId\":\"$SUB_CALCADOS\",\"imageUrl\":\"https://picsum.photos/seed/ultraboost23/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Bota Chelsea Dr. Martens 2976\",\"description\":\"Bota Chelsea iconica em couro Smooth polido, sola Airwair com amortecimento, elasticos laterais para facil calcamento e puxador traseiro.\",\"price\":1199.00,\"stockQuantity\":30,\"category\":\"Calcados\",\"categoryId\":\"$SUB_CALCADOS\",\"imageUrl\":\"https://picsum.photos/seed/drmartens/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Sapato Social Ferragamo Oxford\",\"description\":\"Oxford classico em couro de bezerro italiano com solado de couro costurado Blake, forro em pelica e acabamento artesanal feito na Italia.\",\"price\":4999.00,\"stockQuantity\":12,\"category\":\"Calcados\",\"categoryId\":\"$SUB_CALCADOS\",\"imageUrl\":\"https://picsum.photos/seed/ferragamo/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"New Balance 990v6 Made in USA\",\"description\":\"Tenis premium fabricado nos EUA com cabedal em camurca e mesh, entressola ENCAP com FuelCell, ajuste classico e conforto excepcional para o dia a dia.\",\"price\":1599.00,\"stockQuantity\":25,\"category\":\"Calcados\",\"categoryId\":\"$SUB_CALCADOS\",\"imageUrl\":\"https://picsum.photos/seed/nb990v6/400\"}"
COUNT=$((COUNT+1))
echo "  Calcados: 5 produtos"

# --- ACESSORIOS MODA ---
create_product "{\"name\":\"Relogio Tissot PRX Powermatic 80\",\"description\":\"Relogio automatico suico com caixa de aco de 40mm, fundo transparente, reserva de marcha de 80 horas e pulseira integrada estilo anos 70.\",\"price\":4299.00,\"stockQuantity\":15,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"https://picsum.photos/seed/tissotprx/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Oculos Ray-Ban Aviador Classic\",\"description\":\"Oculos de sol icone com armacao em metal dourado, lentes de cristal verde G-15 que reduzem brilho e 100% de protecao UV.\",\"price\":899.00,\"stockQuantity\":45,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"https://picsum.photos/seed/rayban/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Carteira Montblanc Meisterstuck 6cc\",\"description\":\"Carteira compacta em couro de bezerro europeu com forro em jacquard, 6 compartimentos para cartoes, 2 para notas e emblema Montblanc em paladio.\",\"price\":2199.00,\"stockQuantity\":20,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"https://picsum.photos/seed/montblanc/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Cinto Gucci GG Marmont\",\"description\":\"Cinto em couro granulado preto com fivela GG entrelaçada em metal envelhecido, acabamento premium e largura de 4cm, icone da maison italiana.\",\"price\":2899.00,\"stockQuantity\":18,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"https://picsum.photos/seed/guccicinto/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Cachecol Burberry Cashmere Check\",\"description\":\"Cachecol classico em cashmere puro com o icônico padrao xadrez Burberry, franjas nas pontas, toque ultra macio e dimensoes generosas de 168x30cm.\",\"price\":3999.00,\"stockQuantity\":10,\"category\":\"Acessorios Moda\",\"categoryId\":\"$SUB_ACESSORIOS_MODA\",\"imageUrl\":\"https://picsum.photos/seed/burberry/400\"}"
COUNT=$((COUNT+1))
echo "  Acessorios Moda: 5 produtos"

# --- MOVEIS ---
create_product "{\"name\":\"Poltrona Eames Lounge Chair Replica\",\"description\":\"Replica premium da iconica poltrona Eames em compensado moldado com acabamento nogueira, estofamento em couro italiano e base giratoria em aluminio.\",\"price\":8999.00,\"stockQuantity\":5,\"category\":\"Moveis\",\"categoryId\":\"$SUB_MOVEIS\",\"imageUrl\":\"https://picsum.photos/seed/eames/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Mesa de Jantar Tok Stok Extensivel\",\"description\":\"Mesa de jantar em MDF com tampo extensivel de 1.60m a 2.20m, pes em madeira macica de eucalipto e acabamento em laca branca fosca.\",\"price\":3499.00,\"stockQuantity\":8,\"category\":\"Moveis\",\"categoryId\":\"$SUB_MOVEIS\",\"imageUrl\":\"https://picsum.photos/seed/mesajantar/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Sofa 3 Lugares Linho Natural\",\"description\":\"Sofa contemporaneo em estrutura de madeira macica, estofamento em linho natural lavavel, assentos com espuma D33 e pes em metal dourado.\",\"price\":5999.00,\"stockQuantity\":6,\"category\":\"Moveis\",\"categoryId\":\"$SUB_MOVEIS\",\"imageUrl\":\"https://picsum.photos/seed/sofalinho/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Estante Modular em Carvalho\",\"description\":\"Estante modular com 5 prateleiras em madeira de carvalho europeu com acabamento natural, estrutura em aco preto fosco e design industrial minimalista.\",\"price\":4299.00,\"stockQuantity\":10,\"category\":\"Moveis\",\"categoryId\":\"$SUB_MOVEIS\",\"imageUrl\":\"https://picsum.photos/seed/estante/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Cadeira de Escritorio Herman Miller Aeron\",\"description\":\"Cadeira ergonomica premium com suporte lombar PostureFit SL, mecanismo de inclinacao harmonica, apoio de bracos 4D e malha elastomerica 8Z Pellicle.\",\"price\":12999.00,\"stockQuantity\":7,\"category\":\"Moveis\",\"categoryId\":\"$SUB_MOVEIS\",\"imageUrl\":\"https://picsum.photos/seed/hermanmiller/400\"}"
COUNT=$((COUNT+1))
echo "  Moveis: 5 produtos"

# --- ILUMINACAO ---
create_product "{\"name\":\"Luminaria Pendente Tom Dixon Beat\",\"description\":\"Pendente em latao martelado a mao com formato organico inspirado em utensilios de cozinha indianos. Interior dourado que cria luz quente e acolhedora.\",\"price\":3299.00,\"stockQuantity\":12,\"category\":\"Iluminacao\",\"categoryId\":\"$SUB_ILUMINACAO\",\"imageUrl\":\"https://picsum.photos/seed/tomdixon/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Abajur Kartell Bourgie\",\"description\":\"Abajur icone do design italiano com base em policarbonato transparente estilo barroco, cupula plissada, 3 niveis de intensidade e altura ajustavel.\",\"price\":2499.00,\"stockQuantity\":15,\"category\":\"Iluminacao\",\"categoryId\":\"$SUB_ILUMINACAO\",\"imageUrl\":\"https://picsum.photos/seed/kartell/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Fita LED Smart Philips Hue 2m\",\"description\":\"Fita LED inteligente com 16 milhoes de cores, compativel com Alexa e Google Home, extensivel ate 10m, controle via app e efeitos de iluminacao.\",\"price\":599.00,\"stockQuantity\":60,\"category\":\"Iluminacao\",\"categoryId\":\"$SUB_ILUMINACAO\",\"imageUrl\":\"https://picsum.photos/seed/philipshue/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Luminaria de Mesa Artemide Tolomeo\",\"description\":\"Classico do design industrial italiano com bracos articulados em aluminio polido, base fixa com rotacao 360 graus e difusor em aluminio.\",\"price\":4799.00,\"stockQuantity\":8,\"category\":\"Iluminacao\",\"categoryId\":\"$SUB_ILUMINACAO\",\"imageUrl\":\"https://picsum.photos/seed/artemide/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Lustre Cristal Swarovski 8 Bracos\",\"description\":\"Lustre classico com 8 bracos em metal cromado adornado com cristais Swarovski genuinos, acabamento premium e diametro de 70cm para ambientes amplos.\",\"price\":15999.00,\"stockQuantity\":3,\"category\":\"Iluminacao\",\"categoryId\":\"$SUB_ILUMINACAO\",\"imageUrl\":\"https://picsum.photos/seed/swarovskilustre/400\"}"
COUNT=$((COUNT+1))
echo "  Iluminacao: 5 produtos"

# --- COZINHA ---
create_product "{\"name\":\"Cafeteira Nespresso Vertuo Next\",\"description\":\"Cafeteira com tecnologia Centrifusion para extrair cafe e espresso em 5 tamanhos, aquecimento em 30 segundos e design compacto com capsulas Vertuo.\",\"price\":899.00,\"stockQuantity\":40,\"category\":\"Cozinha\",\"categoryId\":\"$SUB_COZINHA\",\"imageUrl\":\"https://picsum.photos/seed/nespresso/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Panela Le Creuset Redonda 24cm\",\"description\":\"Panela de ferro fundido esmaltada em duas camadas, tampa auto-basting, distribuicao uniforme de calor, resistente a 260C e em iconica cor Flame.\",\"price\":2899.00,\"stockQuantity\":15,\"category\":\"Cozinha\",\"categoryId\":\"$SUB_COZINHA\",\"imageUrl\":\"https://picsum.photos/seed/lecreuset/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Kit Facas Zwilling Pro 7 Pecas\",\"description\":\"Conjunto profissional em aco inox especial SIGMAFORGE, cabo ergonomico em polipropileno, inclui faca do chef, santoku, pao, legumes e cepo de madeira.\",\"price\":3499.00,\"stockQuantity\":12,\"category\":\"Cozinha\",\"categoryId\":\"$SUB_COZINHA\",\"imageUrl\":\"https://picsum.photos/seed/zwilling/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Batedeira KitchenAid Artisan 4.8L\",\"description\":\"Batedeira planetaria com 10 velocidades, motor de 300W, tigela de aco inox de 4.8L, acabamento em metal fundido e mais de 15 acessorios opcionais.\",\"price\":3999.00,\"stockQuantity\":10,\"category\":\"Cozinha\",\"categoryId\":\"$SUB_COZINHA\",\"imageUrl\":\"https://picsum.photos/seed/kitchenaid/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Air Fryer Ninja Foodi Dual Zone 9.5L\",\"description\":\"Fritadeira sem oleo com duas cestas independentes de 4.75L cada, 6 funcoes de cozimento, tecnologia Smart Finish para sincronizar tempos diferentes.\",\"price\":1299.00,\"stockQuantity\":30,\"category\":\"Cozinha\",\"categoryId\":\"$SUB_COZINHA\",\"imageUrl\":\"https://picsum.photos/seed/ninjafoodi/400\"}"
COUNT=$((COUNT+1))
echo "  Cozinha: 5 produtos"

# --- PERFUMES ---
create_product "{\"name\":\"Dior Sauvage Eau de Parfum 100ml\",\"description\":\"Fragancia masculina iconica com notas de bergamota da Calabria, pimenta de Sichuan e acorde ambroxan. Intenso, magnetico e sofisticado.\",\"price\":699.00,\"stockQuantity\":50,\"category\":\"Perfumes\",\"categoryId\":\"$SUB_PERFUMES\",\"imageUrl\":\"https://picsum.photos/seed/diorsauvage/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Chanel N5 Eau de Parfum 100ml\",\"description\":\"O perfume mais famoso do mundo com bouquet floral de ylang-ylang, rosa de maio e jasmin, enriquecido por notas de santal e vetiver.\",\"price\":1199.00,\"stockQuantity\":30,\"category\":\"Perfumes\",\"categoryId\":\"$SUB_PERFUMES\",\"imageUrl\":\"https://picsum.photos/seed/chaneln5/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Tom Ford Black Orchid EDP 50ml\",\"description\":\"Fragancia unissex luxuosa com notas de trufa negra, orquidea negra, bergamota e patchouli escuro. Sensual e misterioso em frasco lacado.\",\"price\":899.00,\"stockQuantity\":25,\"category\":\"Perfumes\",\"categoryId\":\"$SUB_PERFUMES\",\"imageUrl\":\"https://picsum.photos/seed/tomford/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Carolina Herrera Good Girl EDP 80ml\",\"description\":\"Perfume feminino em icônico frasco de sapato stiletto com notas de jasmin sambac, cacau, tonka e tuberosa. Elegante e sedutor.\",\"price\":599.00,\"stockQuantity\":40,\"category\":\"Perfumes\",\"categoryId\":\"$SUB_PERFUMES\",\"imageUrl\":\"https://picsum.photos/seed/goodgirl/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Creed Aventus EDP 100ml\",\"description\":\"Perfume nicho masculino artesanal com notas de abacaxi, betula, musgo de carvalho e ambergris. Celebra forca, poder e sucesso. Frasco feito a mao.\",\"price\":2999.00,\"stockQuantity\":8,\"category\":\"Perfumes\",\"categoryId\":\"$SUB_PERFUMES\",\"imageUrl\":\"https://picsum.photos/seed/creedaventus/400\"}"
COUNT=$((COUNT+1))
echo "  Perfumes: 5 produtos"

# --- SKINCARE ---
create_product "{\"name\":\"La Roche-Posay Effaclar Duo+ 40ml\",\"description\":\"Tratamento facial para pele oleosa com Niacinamida, Piroctone Olamina e LHA. Reduz imperfeicoes, desobstrui poros e controla brilho por 12 horas.\",\"price\":129.00,\"stockQuantity\":100,\"category\":\"Skincare\",\"categoryId\":\"$SUB_SKINCARE\",\"imageUrl\":\"https://picsum.photos/seed/laroche/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Serum Retinol Neutrogena Rapid Wrinkle\",\"description\":\"Serum anti-idade com retinol acelerado e acido hialuronico, reduz visivelmente linhas finas e rugas em apenas uma semana de uso continuo.\",\"price\":189.00,\"stockQuantity\":60,\"category\":\"Skincare\",\"categoryId\":\"$SUB_SKINCARE\",\"imageUrl\":\"https://picsum.photos/seed/neutrogena/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Hidratante Facial Clinique Moisture Surge\",\"description\":\"Gel-creme oil-free com tecnologia Auto-Replenishing que fornece 72 horas de hidratacao intensa. Fortalece a barreira cutanea com aloe vera e acido hialuronico.\",\"price\":299.00,\"stockQuantity\":45,\"category\":\"Skincare\",\"categoryId\":\"$SUB_SKINCARE\",\"imageUrl\":\"https://picsum.photos/seed/clinique/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Protetor Solar Isdin Fusion Water SPF50+\",\"description\":\"Fotoprotetor facial de textura ultralagira aquosa, toque seco, oil-free, com Safe-Eye Tech que nao irrita os olhos e protecao UVA/UVB.\",\"price\":109.00,\"stockQuantity\":80,\"category\":\"Skincare\",\"categoryId\":\"$SUB_SKINCARE\",\"imageUrl\":\"https://picsum.photos/seed/isdin/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Serum Vitamina C Skinceuticals C E Ferulic\",\"description\":\"Serum antioxidante de referencia com 15% de vitamina C pura, vitamina E e acido ferulico. Protege contra danos ambientais e ilumina a pele visivelmente.\",\"price\":599.00,\"stockQuantity\":30,\"category\":\"Skincare\",\"categoryId\":\"$SUB_SKINCARE\",\"imageUrl\":\"https://picsum.photos/seed/skinceuticals/400\"}"
COUNT=$((COUNT+1))
echo "  Skincare: 5 produtos"

# --- MAQUIAGEM ---
create_product "{\"name\":\"Paleta de Sombras Urban Decay Naked 3\",\"description\":\"Paleta iconica com 12 tons rose-hued em acabamentos matte, shimmer e metalico. Pigmentacao intensa, blendavel e longa duracao com primer infused.\",\"price\":399.00,\"stockQuantity\":35,\"category\":\"Maquiagem\",\"categoryId\":\"$SUB_MAQUIAGEM\",\"imageUrl\":\"https://picsum.photos/seed/urbandecay/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Base MAC Studio Fix Fluid SPF15\",\"description\":\"Base liquida de media a alta cobertura com acabamento matte natural, controle de oleosidade por 24 horas e SPF 15 em ampla gama de 60+ tons.\",\"price\":259.00,\"stockQuantity\":50,\"category\":\"Maquiagem\",\"categoryId\":\"$SUB_MAQUIAGEM\",\"imageUrl\":\"https://picsum.photos/seed/macbase/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Batom Liquido Fenty Beauty Stunna Lip\",\"description\":\"Batom liquido matte de longa duracao com cor intensa em uma unica aplicacao. Formula leve e confortavel com acabamento aveludado e resistente a transferencia.\",\"price\":199.00,\"stockQuantity\":55,\"category\":\"Maquiagem\",\"categoryId\":\"$SUB_MAQUIAGEM\",\"imageUrl\":\"https://picsum.photos/seed/fentybeauty/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Mascara de Cilios Too Faced Better Than Sex\",\"description\":\"Mascara best-seller com escova em formato de ampulheta que deposita quantidade perfeita de produto. Volume dramatico, curvatura intensa e formula a prova de borrar.\",\"price\":229.00,\"stockQuantity\":65,\"category\":\"Maquiagem\",\"categoryId\":\"$SUB_MAQUIAGEM\",\"imageUrl\":\"https://picsum.photos/seed/toofaced/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Iluminador Charlotte Tilbury Hollywood Flawless\",\"description\":\"Po iluminador com microparticulas de perola que capturam e refletem a luz para um brilho glamouroso de tapete vermelho. Textura sedosa e buildable.\",\"price\":349.00,\"stockQuantity\":30,\"category\":\"Maquiagem\",\"categoryId\":\"$SUB_MAQUIAGEM\",\"imageUrl\":\"https://picsum.photos/seed/charlottetilbury/400\"}"
COUNT=$((COUNT+1))
echo "  Maquiagem: 5 produtos"

# --- FITNESS ---
create_product "{\"name\":\"Esteira Technogym MyRun\",\"description\":\"Esteira residencial premium com tela touch de 19 polegadas, amortecimento adaptavel, inclinacao ate 12%, velocidade ate 20km/h e design assinado por Antonio Citterio.\",\"price\":24999.00,\"stockQuantity\":3,\"category\":\"Fitness\",\"categoryId\":\"$SUB_FITNESS\",\"imageUrl\":\"https://picsum.photos/seed/technogym/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Halteres Ajustaveis Bowflex 24kg Par\",\"description\":\"Par de halteres ajustaveis de 2 a 24kg cada com mecanismo seletor rapido, substituem 15 pares de halteres tradicionais e incluem suporte.\",\"price\":3999.00,\"stockQuantity\":10,\"category\":\"Fitness\",\"categoryId\":\"$SUB_FITNESS\",\"imageUrl\":\"https://picsum.photos/seed/bowflex/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Tapete Yoga Manduka PRO 6mm\",\"description\":\"Tapete profissional em PVC de celula fechada com 6mm de espessura, superfice antiderrapante, amortecimento denso e garantia vitalicia. Certificado OEKO-TEX.\",\"price\":799.00,\"stockQuantity\":30,\"category\":\"Fitness\",\"categoryId\":\"$SUB_FITNESS\",\"imageUrl\":\"https://picsum.photos/seed/manduka/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Corda de Pular Speed Rope Velites\",\"description\":\"Corda de velocidade profissional com rolamento de alta precisao, cabo de aco revestido, pegadores em aluminio e peso ajustavel para treinos de CrossFit.\",\"price\":349.00,\"stockQuantity\":50,\"category\":\"Fitness\",\"categoryId\":\"$SUB_FITNESS\",\"imageUrl\":\"https://picsum.photos/seed/velites/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Kettlebell Competition 16kg Rogue\",\"description\":\"Kettlebell de competicao em aco com dimensoes padrao independente do peso, acabamento em e-coat resistente, base plana e alcada de 33mm para grip otimo.\",\"price\":699.00,\"stockQuantity\":20,\"category\":\"Fitness\",\"categoryId\":\"$SUB_FITNESS\",\"imageUrl\":\"https://picsum.photos/seed/roguekb/400\"}"
COUNT=$((COUNT+1))
echo "  Fitness: 5 produtos"

# --- CORRIDA ---
create_product "{\"name\":\"Tenis Nike Vaporfly 3\",\"description\":\"Tenis de corrida de elite com placa de fibra de carbono ZoomX, espuma ultraresponsiva, cabedal Flyknit ultraleve e drop de 8mm para maxima propulsao.\",\"price\":2199.00,\"stockQuantity\":20,\"category\":\"Corrida\",\"categoryId\":\"$SUB_CORRIDA\",\"imageUrl\":\"https://picsum.photos/seed/vaporfly3/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Relogio Garmin Forerunner 965\",\"description\":\"GPS de corrida premium com tela AMOLED touchscreen, mapas coloridos, metricas avancadas de treino, VO2 max, stamina em tempo real e ate 23 dias de bateria.\",\"price\":5499.00,\"stockQuantity\":12,\"category\":\"Corrida\",\"categoryId\":\"$SUB_CORRIDA\",\"imageUrl\":\"https://picsum.photos/seed/forerunner965/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Shorts Nike Dri-FIT Stride 5pol\",\"description\":\"Shorts de corrida com tecnologia Dri-FIT que afasta o suor da pele, forro interno de suporte, cintura elastica com cordao e bolso traseiro com ziper.\",\"price\":249.00,\"stockQuantity\":70,\"category\":\"Corrida\",\"categoryId\":\"$SUB_CORRIDA\",\"imageUrl\":\"https://picsum.photos/seed/nikeshorts/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Cinto de Hidratacao Camelbak Ultra\",\"description\":\"Cinto ergonomico com duas garrafas de 500ml Quick Stow, bolso expansivel para celular, tecido 3D mesh ventilado e ajuste elastico confortavel.\",\"price\":399.00,\"stockQuantity\":35,\"category\":\"Corrida\",\"categoryId\":\"$SUB_CORRIDA\",\"imageUrl\":\"https://picsum.photos/seed/camelbak/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Meias de Compressao Stance Run Tab\",\"description\":\"Meias de corrida com compressao graduada, tecnologia Feel360 que elimina umidade, arco de suporte anatomico e amortecimento estrategico no calcanhar.\",\"price\":129.00,\"stockQuantity\":90,\"category\":\"Corrida\",\"categoryId\":\"$SUB_CORRIDA\",\"imageUrl\":\"https://picsum.photos/seed/stancemeias/400\"}"
COUNT=$((COUNT+1))
echo "  Corrida: 5 produtos"

# --- NATACAO ---
create_product "{\"name\":\"Oculos de Natacao Speedo Fastskin Pure Focus\",\"description\":\"Oculos de competicao com lentes curvadas IQfit anti-embaçante, vedacao ultrafina em silicone, ponte nasal ajustavel e campo de visao ampliado.\",\"price\":499.00,\"stockQuantity\":35,\"category\":\"Natacao\",\"categoryId\":\"$SUB_NATACAO\",\"imageUrl\":\"https://picsum.photos/seed/speedooculos/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Maio de Competicao Arena Powerskin Carbon\",\"description\":\"Maio de competicao aprovado pela FINA com tecnologia Carbon Cage para compressao muscular otima, tecido de secagem ultra rapida e costuras coladas.\",\"price\":1899.00,\"stockQuantity\":12,\"category\":\"Natacao\",\"categoryId\":\"$SUB_NATACAO\",\"imageUrl\":\"https://picsum.photos/seed/arenamaio/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Prancha de Natacao Finis Alignment\",\"description\":\"Prancha ergonomica em EVA de alta densidade com design assimetrico que corrige alinhamento corporal, melhora a tecnica de pernada e fortalece o core.\",\"price\":199.00,\"stockQuantity\":40,\"category\":\"Natacao\",\"categoryId\":\"$SUB_NATACAO\",\"imageUrl\":\"https://picsum.photos/seed/finisprancha/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Touca de Natacao Speedo Fastskin3 Hair\",\"description\":\"Touca de competicao em silicone 3D com design anatomico que reduz arrasto, superfice texturizada e tecnologia Biofuse para ajuste perfeito ao cranio.\",\"price\":149.00,\"stockQuantity\":55,\"category\":\"Natacao\",\"categoryId\":\"$SUB_NATACAO\",\"imageUrl\":\"https://picsum.photos/seed/speedotouca/400\"}"
COUNT=$((COUNT+1))

create_product "{\"name\":\"Nadadeiras Finis Zoomers Gold\",\"description\":\"Nadadeiras curtas em borracha natural com design de angulo agudo que aumenta velocidade e potencia de pernada, ideais para treino de sprint e tecnica.\",\"price\":299.00,\"stockQuantity\":25,\"category\":\"Natacao\",\"categoryId\":\"$SUB_NATACAO\",\"imageUrl\":\"https://picsum.photos/seed/finiszoomers/400\"}"
COUNT=$((COUNT+1))
echo "  Natacao: 5 produtos"

echo ""
echo "============================================"
echo "  Seed concluido com sucesso!"
echo "  Total: $COUNT produtos criados"
echo "  Categorias: 5 pai + 17 subcategorias"
echo "============================================"
