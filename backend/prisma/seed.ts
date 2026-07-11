import { PrismaClient, Status } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ─── Dados realistas ─────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Política", slug: "politica", description: "Cobertura política da Bahia e do Brasil", order: 1 },
  { name: "Economia", slug: "economia", description: "Finanças, mercado e economia nacional", order: 2 },
  { name: "Esportes", slug: "esportes", description: "Futebol baiano e esportes em geral", order: 3 },
  { name: "Cultura", slug: "cultura", description: "Arte, música, cinema e eventos culturais", order: 4 },
  { name: "Bahia", slug: "bahia", description: "Notícias do estado da Bahia", order: 5 },
  { name: "Tecnologia", slug: "tecnologia", description: "Inovação, ciência e tecnologia", order: 6 },
  { name: "Polícia", slug: "policia", description: "Segurança pública e ocorrências policiais", order: 7 },
  { name: "Saúde", slug: "saude", description: "Saúde pública, bem-estar e medicina", order: 8 },
];

const TAGS = [
  { name: "Salvador", slug: "salvador" },
  { name: "Carnaval", slug: "carnaval" },
  { name: "Eleições 2026", slug: "eleicoes-2026" },
  { name: "São João", slug: "sao-joao" },
  { name: "Copa do Brasil", slug: "copa-do-brasil" },
  { name: "BBB 26", slug: "bbb-26" },
  { name: "Seca", slug: "seca" },
  { name: "Turismo", slug: "turismo" },
  { name: "Congresso Nacional", slug: "congresso-nacional" },
  { name: "Petrobras", slug: "petrobras" },
  { name: "Inteligência Artificial", slug: "inteligencia-artificial" },
  { name: "Energia Solar", slug: "energia-solar" },
  { name: "Culinária Baiana", slug: "culinaria-baiana" },
  { name: "Vestibular", slug: "vestibular" },
  { name: "Clima", slug: "clima" },
  { name: "Mundial", slug: "mundial" },
];

interface NewsSeed {
  title: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  tagSlugs: string[];
  authorRole: "ADMIN" | "EDITOR" | "JOURNALIST";
  status: Status;
  isFeatured?: boolean;
  isBreaking?: boolean;
  daysAgo?: number;
  views?: number;
}

const NEWS: NewsSeed[] = [
  // ── Breaking / Últimas ──────────────────────────────────────────────
  {
    title: "IA em Alerta — Polêmica, Regulação e Soberania Nacional Dominam a Semana",
    excerpt: "Especialistas debatem os rumos da regulação de inteligência artificial no Brasil enquanto projetos de lei avançam no Congresso.",
    content: `<h2>O debate esquenta</h2>
<p>A semana foi marcada por intensos debates sobre os rumos da inteligência artificial no Brasil. Enquanto o Congresso Nacional se prepara para votar o marco regulatório da IA, especialistas alertam para os riscos e oportunidades que a tecnologia apresenta.</p>
<p>O Projeto de Lei 2338/2023, que estabelece o marco legal da inteligência artificial no Brasil, ganhou urgência após uma série de incidentes envolvendo deepfakes e desinformação nas eleições municipais. O relator da matéria, senador Eduardo Gomes (PL-TO), afirmou que o texto final deve conciliar inovação com proteção de direitos fundamentais.</p>
<h2>Impacto na soberania nacional</h2>
<p>Um dos pontos mais polêmicos diz respeito à soberania digital. "Não podemos repetir o erro que cometemos com as redes sociais, onde empresas estrangeiras operam sem qualquer contrapartida ou respeito às leis brasileiras", alerta a professora da USP, Dra. Ana Beatriz Souza.</p>
<p>Grandes empresas de tecnologia como Google, Microsoft e OpenAI já começaram a se mobilizar, enviando representantes para Brasília e contratando lobistas. Dados do Datafolha mostram que 73% dos brasileiros apoiam a criação de regras específicas para IA.</p>
<p>O presidente Luiz Inácio Lula da Silva deve sancionar o projeto ainda neste semestre, segundo fontes do Palácio do Planalto.</p>`,
    categorySlug: "tecnologia",
    tagSlugs: ["inteligencia-artificial", "congresso-nacional"],
    authorRole: "ADMIN",
    status: "PUBLISHED",
    isFeatured: true,
    isBreaking: true,
    daysAgo: 0,
    views: 15230,
  },
  {
    title: "Salvador se Prepara para o Maior Carnaval da História em 2027",
    excerpt: "Prefeitura anuncia investimento recorde de R$ 120 milhões para a folia momesca; expectativa é receber 5 milhões de foliões.",
    content: `<p>A Prefeitura de Salvador anunciou nesta manhã o maior investimento da história para o Carnaval de 2027. Serão R$ 120 milhões destinados à infraestrutura, segurança e contratação de artistas para a festa que promete receber mais de 5 milhões de foliões ao longo de sete dias.</p>
<p>O prefeito Bruno Reis (UB) afirmou em coletiva que o investimento é 20% superior ao do ano anterior. "Queremos fazer o maior Carnaval do planeta, superando até mesmo o Rio de Janeiro", declarou.</p>
<p>Entre as novidades estão a ampliação do Circuito Dodô (Barra-Ondina) com novo trecho na Arena Fonte Nova, a criação do "Circuito da Paz" nos bairros periféricos e a volta do trio elétrico de Luiz Caldas no domingo de abertura.</p>
<p>As atrações confirmadas incluem Ivete Sangalo, Claudia Leitte, Bell Marques, Carlinhos Brown, BaianaSystem e os principais blocos afro como Ilê Aiyê e Olodum. O secretário de Cultura, Pedro Tourinho, adiantou que há negociações avançadas com Anitta e Ludmilla para participações especiais.</p>`,
    categorySlug: "cultura",
    tagSlugs: ["salvador", "carnaval", "turismo"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    isBreaking: true,
    isFeatured: true,
    daysAgo: 1,
    views: 28450,
  },
  {
    title: "Greve dos Professores: Aulas Suspensas em 180 Escolas da Bahia",
    excerpt: "Categoria reivindica reajuste salarial de 12% e melhores condições de trabalho; governo do estado convoca reunião emergencial.",
    content: `<h2>Paralisação atinge milhares de alunos</h2>
<p>A greve dos professores da rede estadual da Bahia completou hoje o quinto dia sem negociação. Mais de 180 escolas estão com aulas suspensas em todo o estado, afetando aproximadamente 120 mil estudantes.</p>
<p>A categoria reivindica reajuste salarial de 12%, pagamento integral dos precatórios do Fundef e melhores condições de trabalho, como infraestrutura adequada nas escolas e fornecimento de materiais didáticos.</p>
<p>O Sindicato dos Trabalhadores em Educação do Estado da Bahia (APLB) afirmou que não aceita a proposta de 4,5% oferecida pelo governo. "É um desrespeito com a categoria que ficou anos sem reajuste", declarou a presidente do sindicato, Marilene Santos.</p>
<p>O governo estadual convocou uma reunião emergencial para esta quinta-feira, mediada pelo Tribunal de Justiça da Bahia. O secretário de Educação, Danilo Souza, disse estar confiante em um acordo. "Reconhecemos a importância dos professores e queremos construir uma solução", afirmou.</p>`,
    categorySlug: "bahia",
    tagSlugs: ["salvador"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    isBreaking: true,
    daysAgo: 0,
    views: 8920,
  },

  // ── Política ────────────────────────────────────────────────────────
  {
    title: "Reforma Tributária: Nova Fase de Regulamentação Começa a Tramitar no Senado",
    excerpt: "Texto complementar define alíquotas e exceções; expectativa é de votação em até 60 dias.",
    content: `<p>O Senado Federal começou a analisar nesta semana o segundo projeto de lei complementar que regulamenta a Reforma Tributária (EC 132/2023), agora focado na definição de alíquotas específicas e regimes diferenciados para setores como saúde, educação e transporte.</p>
<p>O relator, senador Omar Aziz (PSD-AM), apresentou seu parecer nesta terça-feira, mantendo a alíquota padrão do IBS e CBS em 26,5%, mas ampliando as exceções para a cesta básica de alimentos e medicamentos essenciais. "Estamos construindo um sistema mais justo, que não aumenta a carga tributária e simplifica a vida do contribuinte", declarou.</p>
<p>A expectativa é que o texto seja votado no plenário em até 60 dias, antes do recesso parlamentar de julho. A Câmara dos Deputados já aprovou o primeiro projeto complementar em abril.</p>`,
    categorySlug: "politica",
    tagSlugs: ["congresso-nacional"],
    authorRole: "ADMIN",
    status: "PUBLISHED",
    isFeatured: true,
    daysAgo: 2,
    views: 5680,
  },
  {
    title: "Pré-candidaturas para 2026: Nomes se Consolidam nos Principais Partidos Baianos",
    excerpt: "Definições de candidatos ao governo e senado começam a tomar forma nos diretórios estaduais.",
    content: `<p>Com a aproximação das eleições de 2026, os principais partidos políticos da Bahia começam a movimentar suas pré-candidaturas. No PT, o nome do atual governador Jerônimo Rodrigues é dado como certo à reeleição, enquanto o União Brasil ainda busca um nome competitivo para encabeçar a chapa.</p>
<p>O senador Otto Alencar (PSD) deve disputar a reeleição, enquanto o ex-prefeito de Salvador, ACM Neto (UB), ainda não definiu se concorrerá novamente ao governo ou ao senado. Já o PL deve lançar o deputado federal Capitão Alden para o governo, tentando capitalizar o eleitorado conservador do estado.</p>
<p>Uma pesquisa do instituto DataTrend divulgada hoje mostra Jerônimo com 42% das intenções de voto, seguido por ACM Neto com 28% e Capitão Alden com 12%.</p>`,
    categorySlug: "politica",
    tagSlugs: ["eleicoes-2026", "salvador"],
    authorRole: "ADMIN",
    status: "PUBLISHED",
    daysAgo: 3,
    views: 7230,
  },

  // ── Economia ────────────────────────────────────────────────────────
  {
    title: "Dólar Opera a R$ 5,85 com Expectativa de Corte de Juros nos EUA",
    excerpt: "Mercado financeiro reage a sinais de desaceleração da economia americana e possível redução da taxa de juros pelo Fed.",
    content: `<p>O dólar comercial fechou esta quarta-feira cotado a R$ 5,85, em queda de 1,2% no dia, refletindo a expectativa do mercado de que o Federal Reserve (Fed) possa iniciar um ciclo de corte de juros ainda neste semestre. Dados de emprego nos EUA vieram abaixo do esperado, reforçando essa percepção.</p>
<p>No cenário doméstico, o Ibovespa subiu 1,8%, impulsionado por ações de commodities e bancos. A Petrobras (PETR4) avançou 2,3% após anúncio de nova política de preços para o diesel.</p>
<p>O economista-chefe do Banco Master, Paulo Gala, avalia que "o real tende a se valorizar se o Fed realmente cortar os juros, pois isso reduz a atratividade do dólar como investimento". No entanto, ele alerta para riscos fiscais domésticos que podem limitar essa valorização.</p>
<p>A ata do Copom, divulgada ontem, indicou que o Banco Central mantém cautela com a inflação de serviços e não sinalizou mudanças na taxa Selic, atualmente em 13,75% ao ano.</p>`,
    categorySlug: "economia",
    tagSlugs: ["petrobras"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    daysAgo: 1,
    views: 4350,
  },
  {
    title: "Petrobras Anuncia Descoberta de Nova Reserva de Petróleo na Margem Equatorial",
    excerpt: "Estimativa preliminar aponta para reserva de 2 bilhões de barris; descoberta pode colocar o Brasil entre os 5 maiores produtores do mundo.",
    content: `<p>A Petrobras anunciou hoje a descoberta de uma nova reserva de petróleo na Margem Equatorial, na bacia da Foz do Amazonas. A estimativa preliminar da estatal aponta para um potencial de até 2 bilhões de barris de petróleo, o que poderia colocar o Brasil entre os cinco maiores produtores mundiais.</p>
<p>A descoberta reacende o debate ambiental sobre a exploração na região. O Ibama ainda não concedeu a licença ambiental para a perfuração, e organizações como Greenpeace e WWF já manifestaram oposição. "Os riscos de um vazamento na região seriam catastróficos para o ecossistema amazônico", alerta a diretora do Observatório do Clima, Suely Araújo.</p>
<p>O presidente da Petrobras, José Mauro Coelho, defendeu a exploração com responsabilidade ambiental. "Tecnologia e segurança são prioridades. A Margem Equatorial pode ser o próximo pré-sal", afirmou.</p>`,
    categorySlug: "economia",
    tagSlugs: ["petrobras"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    isFeatured: true,
    daysAgo: 2,
    views: 12100,
  },

  // ── Esportes ────────────────────────────────────────────────────────
  {
    title: "Bahia Vence o Clássico Ba-Vi por 2 a 0 na Fonte Nova e Assume Liderança",
    excerpt: "Tricolor domina o rival com gols de Cauly e Everaldo; público de 48 mil pessoas marca recorde no estádio.",
    content: `<p>O Esporte Clube Bahia venceu o clássico Ba-Vi por 2 a 0 na noite deste domingo, na Arena Fonte Nova, em partida válida pelo Campeonato Brasileiro. Com o resultado, o Tricolor assumiu a liderança da competição com 28 pontos.</p>
<p>Os gols saíram no segundo tempo: Cauly abriu o placar aos 12 minutos, após bela jogada individual pela direita. Everaldo ampliou aos 38 minutos, de cabeça, após cruzamento preciso de Biel. O público de 48.127 pessoas foi o maior do estádio em 2026.</p>
<p>O técnico Rogério Ceni elogiou a atuação da equipe. "Fizemos um jogo inteligente, controlando as ações do início ao fim. O grupo está de parabéns", disse em entrevista coletiva.</p>
<p>O Vitória, por sua vez, segue na zona de rebaixamento, na 17ª posição com 15 pontos. O técnico Thiago Carpini reconheceu a superioridade do rival. "Precisamos reagir rápido para não nos distanciarmos ainda mais", afirmou.</p>`,
    categorySlug: "esportes",
    tagSlugs: ["copa-do-brasil", "salvador"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    isFeatured: true,
    daysAgo: 0,
    views: 32100,
  },
  {
    title: "Brasil é Sorteado no Grupo da Morte para a Copa do Mundo de 2026",
    excerpt: "Seleção brasileira enfrentará Alemanha, Senegal e Austrália na primeira fase, em um dos grupos mais equilibrados do torneio.",
    content: `<p>A Seleção Brasileira conheceu nesta sexta-feira seus adversários na primeira fase da Copa do Mundo de 2026, que será sediada por Estados Unidos, Canadá e México. O sorteio realizado em Miami colocou o Brasil no chamado "Grupo da Morte", ao lado de Alemanha, Senegal e Austrália.</p>
<p>O técnico Dorival Júnior comentou o sorteio com otimismo: "É verdade que é um grupo difícil, mas para ser campeão é preciso vencer os melhores. Estamos preparados." O primeiro jogo do Brasil será contra a Austrália no SoFi Stadium, em Los Angeles.</p>
<p>A estreia está marcada para 15 de junho de 2026. A expectativa é que mais de 60 mil brasileiros acompanhem a seleção nos Estados Unidos durante a competição.</p>`,
    categorySlug: "esportes",
    tagSlugs: ["mundial"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    daysAgo: 4,
    views: 45200,
  },

  // ── Bahia ───────────────────────────────────────────────────────────
  {
    title: "Chuvas Intensas Causam Estragos em 12 Cidades do Sul da Bahia",
    excerpt: "Defesa Civil contabiliza mais de 3 mil desabrigados; governo federal reconhece estado de calamidade pública.",
    content: `<p>As fortes chuvas que atingem o Sul da Bahia desde o último fim de semana já causaram estragos em 12 municípios, segundo boletim divulgado pela Defesa Civil estadual. Mais de 3 mil pessoas estão desabrigadas ou desalojadas, e pelo menos 2 óbitos foram confirmados.</p>
<p>As cidades mais atingidas são Itabuna, Ilhéus e Canavieiras, onde ruas inteiras foram alagadas e pontes cederam com a força da água. O governo federal reconheceu o estado de calamidade pública, liberando recursos emergenciais para assistência humanitária e reconstrução da infraestrutura danificada.</p>
<p>O governador Jerônimo Rodrigues visitou as áreas afetadas nesta terça e anunciou um pacote de R$ 50 milhões em ajuda. "Estamos mobilizando toda a máquina pública para atender a população", declarou. A Defesa Civil recomenda que moradores de áreas de risco busquem abrigos municipais.</p>`,
    categorySlug: "bahia",
    tagSlugs: ["salvador", "clima"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    daysAgo: 1,
    views: 19800,
  },
  {
    title: "Festa de São João 2026: Maior Arraiá do Interior Começa em Amargosa",
    excerpt: "Expectativa é de 200 mil visitantes nos 10 dias de festa; movimento já aquece economia de 45 municípios baianos.",
    content: `<p>Começou nesta quinta-feira a tradicional Festa de São João de Amargosa, considerada o maior arraiá do interior da Bahia. A expectativa da prefeitura é receber 200 mil visitantes ao longo de 10 dias de programação, que inclui shows de forró, quadrilhas juninas e comidas típicas.</p>
<p>Este ano, a festa homenageia os 100 anos de Luiz Gonzaga, o Rei do Baião, com uma exposição interativa sobre sua vida e obra. A programação musical conta com atrações como Alceu Valença, Elba Ramalho, Flávio José e a banda de forró Estakazero.</p>
<p>O São João movimenta a economia de 45 municípios baianos, gerando mais de 50 mil empregos temporários. Segundo a Secretaria de Turismo do Estado, a estimativa é de que os festejos injetem R$ 1,5 bilhão na economia baiana este ano.</p>`,
    categorySlug: "bahia",
    tagSlugs: ["sao-joao", "turismo", "culinaria-baiana"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    daysAgo: 5,
    views: 8750,
  },

  // ── Cultura ─────────────────────────────────────────────────────────
  {
    title: "Museu de Arte Moderna da Bahia Reabre com Exposição de Portinari e Tarsila",
    excerpt: "Acervo recuperado após reforma de R$ 8 milhões apresenta obras inéditas no estado.",
    content: `<p>O Museu de Arte Moderna da Bahia (MAM-BA) reabriu suas portas ao público nesta quarta-feira após uma reforma de R$ 8 milhões que durou 18 meses. A exposição de reabertura reúne obras de Candido Portinari e Tarsila do Amaral, algumas delas nunca antes exibidas no estado.</p>
<p>A curadoria, assinada pela historiadora da arte Lília Moritz Schwarcz, traça um panorama da arte brasileira do século XX, com destaque para o modernismo. "É uma oportunidade única de ver estas obras-primas lado a lado", afirmou a curadora na abertura.</p>
<p>O governo do estado investiu na modernização do sistema de climatização, iluminação e acessibilidade do museu. Agora, o MAM-BA conta com rampas, elevadores e audiodescrição para visitantes com deficiência. A entrada é gratuita aos domingos.</p>`,
    categorySlug: "cultura",
    tagSlugs: ["salvador"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    daysAgo: 3,
    views: 3420,
  },

  // ── Tecnologia ──────────────────────────────────────────────────────
  {
    title: "Startup Baiana de Energia Solar é Adquirida por Gigante Europeia por US$ 450 Milhões",
    excerpt: "A SunBahia, fundada em Salvador em 2018, se torna o maior exit do ecossistema de inovação do Nordeste.",
    content: `<p>A SunBahia, startup baiana especializada em energia solar fundada em 2018 na aceleradora do SENAI CIMATEC, foi adquirida pela multinacional alemã E.ON por US$ 450 milhões. O negócio representa o maior exit do ecossistema de inovação do Nordeste brasileiro.</p>
<p>A empresa desenvolveu uma tecnologia patenteada de painéis solares flexíveis que podem ser integrados a telhados e fachadas de edificações históricas sem comprometer a estética. A solução já está presente em 14 estados brasileiros e tem planos de expansão para a América Latina.</p>
<p>"Este é um marco para o empreendedorismo baiano. Mostramos que é possível inovar e competir globalmente saindo de Salvador", comemorou a CEO e fundadora, Mônica Andrade, engenheira elétrica formada pela UFBA.</p>`,
    categorySlug: "tecnologia",
    tagSlugs: ["energia-solar", "salvador"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    isFeatured: true,
    daysAgo: 2,
    views: 15670,
  },
  {
    title: "Universidades Baianas Lideram Ranking de Inovação Tecnológica no Nordeste",
    excerpt: "UFBA e UNEB aparecem entre as 30 melhores do país em número de patentes registradas e startups incubadas.",
    content: `<p>A Universidade Federal da Bahia (UFBA) e a Universidade do Estado da Bahia (UNEB) lideram o ranking de inovação tecnológica entre as instituições de ensino do Nordeste, segundo levantamento do Instituto Nacional de Propriedade Industrial (INPI) divulgado hoje.</p>
<p>A UFBA registrou 45 patentes em 2025, um recorde histórico, enquanto a UNEB se destacou na incubação de startups, com 12 empresas de base tecnológica lançadas no mesmo período. Os dados colocam ambas entre as 30 universidades mais inovadoras do país.</p>
<p>O pró-reitor de pesquisa da UFBA, professor Paulo Miguez, atribuiu o resultado aos investimentos em laboratórios multiusuários e parcerias com o setor produtivo. "A pesquisa aplicada é o caminho para o desenvolvimento do estado", afirmou.</p>`,
    categorySlug: "tecnologia",
    tagSlugs: ["inteligencia-artificial"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    daysAgo: 6,
    views: 2150,
  },

  // ── Polícia ─────────────────────────────────────────────────────────
  {
    title: "Operação Policial Desarticula Esquema de Tráfico Internacional em Porto de Salvador",
    excerpt: "Polícia Federal apreende 1,2 tonelada de cocaína; 8 suspeitos são presos em ação conjunta com a PF e Receita Federal.",
    content: `<p>A Polícia Federal deflagrou na madrugada desta quinta-feira a Operação Porto Limpo, que resultou na apreensão de 1,2 tonelada de cocaína no Porto de Salvador e na prisão de 8 suspeitos. A droga estava escondida em um container que seria embarcado para a Europa.</p>
<p>A ação, realizada em conjunto com a Receita Federal, é considerada uma das maiores apreensões de cocaína já realizadas na Bahia. A droga estava dividida em tabletes e acondicionada em meio a uma carga de café solúvel.</p>
<p>Os presos, que incluem dois funcionários do porto e um despachante aduaneiro, serão indiciados por tráfico internacional de drogas e associação criminosa. As investigações continuam para identificar outros envolvidos.</p>`,
    categorySlug: "policia",
    tagSlugs: ["salvador"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    daysAgo: 1,
    views: 22100,
  },
  {
    title: "Número de Assaltos a Ônibus Cai 40% em Salvador no Primeiro Semestre",
    excerpt: "Integração com aplicativos de rastreamento e policiamento ostensivo são apontados como principais fatores para a redução.",
    content: `<p>O número de assaltos a ônibus em Salvador registrou uma queda de 40% no primeiro semestre de 2026 em comparação com o mesmo período do ano anterior, segundo dados divulgados pela Secretaria de Segurança Pública da Bahia (SSP-BA).</p>
<p>Foram registrados 186 casos entre janeiro e junho de 2026, contra 310 no mesmo período de 2025. A SSP atribui a redução à integração do sistema de rastreamento dos ônibus com as centrais de monitoramento da polícia, além do aumento do policiamento ostensivo nas principais vias da cidade.</p>
<p>"Estamos no caminho certo, mas ainda há muito a ser feito. A meta é reduzir em 60% até o final do ano", afirmou o secretário Marcelo Werner. O Sindicato dos Rodoviários também celebrou os números, mas cobrou mais investimentos em segurança.</p>`,
    categorySlug: "policia",
    tagSlugs: ["salvador"],
    authorRole: "JOURNALIST",
    status: "PUBLISHED",
    daysAgo: 4,
    views: 5630,
  },

  // ── Saúde ───────────────────────────────────────────────────────────
  {
    title: "Bahia Alcança 95% de Cobertura Vacinal Contra a Dengue em Menores de 15 Anos",
    excerpt: "Estado ultrapassa meta do Ministério da Saúde com campanha de vacinação em escolas e postos de saúde.",
    content: `<p>A Bahia alcançou a marca de 95% de cobertura vacinal contra a dengue em crianças e adolescentes de 10 a 14 anos, superando a meta estabelecida pelo Ministério da Saúde. O resultado foi alcançado após uma campanha intensiva de vacinação em escolas e postos de saúde de todo o estado.</p>
<p>A Secretaria de Saúde do Estado (Sesab) atribui o sucesso à estratégia de vacinação nas escolas, que permitiu alcançar jovens que não tinham acesso regular aos postos de saúde. "Fizemos uma força-tarefa que envolveu mais de 5 mil profissionais de saúde", comemorou a secretária Roberta Santana.</p>
<p>Com a alta cobertura, os casos graves de dengue caíram 65% em relação ao ano anterior. A expectativa é expandir a campanha para outras faixas etárias ainda este ano, dependendo da disponibilidade de doses enviadas pelo Ministério da Saúde.</p>`,
    categorySlug: "saude",
    tagSlugs: ["salvador"],
    authorRole: "EDITOR",
    status: "PUBLISHED",
    daysAgo: 3,
    views: 4680,
  },
  {
    title: "Hospital Sarah de Salvador Inicia Cirurgias Robóticas pelo SUS",
    excerpt: "Unidade é a primeira do Norte-Nordeste a realizar procedimentos com robô de última geração financiado pelo sistema público.",
    content: `<p>O Hospital Sarah Kubitschek, em Salvador, iniciou nesta semana as primeiras cirurgias robóticas pelo Sistema Único de Saúde (SUS) no Norte-Nordeste. O hospital recebeu um robô cirúrgico Da Vinci de última geração, com investimento de R$ 12 milhões do Ministério da Saúde.</p>
<p>Nas primeiras 48 horas, foram realizadas 5 cirurgias de alta complexidade, incluindo prostatectomias e cirurgias ginecológicas. "A tecnologia robótica permite maior precisão, menor tempo de recuperação e menos riscos de complicações", explicou o cirurgião-chefe, Dr. Antônio Lacerda.</p>
<p>A meta é realizar 30 cirurgias robóticas por mês no primeiro ano, com expansão gradual para outros tipos de procedimentos. Pacientes de todo o estado serão referenciados para o hospital, que é referência nacional em medicina reabilitadora.</p>`,
    categorySlug: "saude",
    tagSlugs: ["salvador", "tecnologia"],
    authorRole: "ADMIN",
    status: "PUBLISHED",
    daysAgo: 5,
    views: 7890,
  },

  // ── Rascunhos (DRAFT) ──────────────────────────────────────────────
  {
    title: "Exclusivo: Governo Prepara Novo Programa de Crédito para Microempreendedores",
    excerpt: "Programa 'Bahia Empreende' deve oferecer linhas de crédito com juros reduzidos para MEIs e pequenos negócios.",
    content: `<p>O governo da Bahia está nos estágios finais de elaboração de um novo programa de crédito voltado para microempreendedores individuais (MEIs) e pequenos negócios, apurou a reportagem com exclusividade. Batizado de "Bahia Empreende", o programa deve oferecer linhas de crédito com juros a partir de 0,5% ao mês.</p>
<p>A expectativa é que o programa seja lançado ainda neste mês, com orçamento inicial de R$ 200 milhões. Microempreendedores de todo o estado poderão solicitar empréstimos de até R$ 20 mil, com carência de 6 meses e prazo de pagamento de até 36 meses.</p>
<p>Fontes da Secretaria de Desenvolvimento Econômico afirmaram que o programa será operacionalizado em parceria com o Banco do Brasil e a Caixa Econômica Federal.</p>`,
    categorySlug: "economia",
    tagSlugs: ["salvador"],
    authorRole: "JOURNALIST",
    status: "DRAFT",
    daysAgo: 0,
    views: 0,
  },
  {
    title: "Entrevista: O Futuro da Mobilidade Urbana em Salvador",
    excerpt: "Secretário de Mobilidade fala sobre VLT, BRT e planos para desafogar o trânsito da capital baiana.",
    content: `<p>O secretário de Mobilidade Urbana de Salvador, Fábio Mota, concedeu entrevista exclusiva ao Portal NTB para falar sobre os planos da prefeitura para o trânsito da capital baiana.</p>
<p>Entre os temas abordados estão o andamento das obras do VLT (Veículo Leve sobre Trilhos), que deve ligar o Subúrbio Ferroviário ao centro da cidade, a expansão do BRT e as intervenções para melhorar a mobilidade nos bairros mais populosos.</p>
<p>A entrevista completa será publicada em breve.</p>`,
    categorySlug: "bahia",
    tagSlugs: ["salvador", "turismo"],
    authorRole: "JOURNALIST",
    status: "DRAFT",
    daysAgo: 0,
    views: 0,
  },

  // ── Arquivada ──────────────────────────────────────────────────────
  {
    title: "Antiga: Prefeitura de Salvador Anuncia Programa de Reciclagem (2025)",
    excerpt: "[ARQUIVADO] Programa 'Salvador Recicla' completa um ano com resultados abaixo do esperado.",
    content: `<p>Notícia arquivada para referência histórica. O programa Salvador Recicla, lançado em 2025 pela Prefeitura de Salvador, completa um ano com resultados abaixo da meta inicial. Apenas 8% dos resíduos domiciliares são reciclados na capital baiana, contra a meta de 15%.</p>`,
    categorySlug: "bahia",
    tagSlugs: ["salvador"],
    authorRole: "EDITOR",
    status: "ARCHIVED",
    daysAgo: 60,
    views: 1200,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

let slugCounter = 0;

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(8 + (days % 12));
  d.setMinutes(30);
  return d;
}

function generateSlug(text: string): string {
  let slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Evitar slugs duplicados adicionando sufixo incremental
  slugCounter++;
  slug = `${slug}-${slugCounter}`;

  return slug;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // 1. Portal
  const portal = await prisma.portal.upsert({
    where: { slug: "portal-bahia" },
    update: {},
    create: {
      name: "Portal Bahia",
      slug: "portal-bahia",
      description: "Portal de notícias da Bahia — informação com credibilidade",
      active: true,
    },
  });
  console.log(`✅ Portal: ${portal.name}`);

  // 2. Roles
  const rolesData = [
    { name: "ADMIN", description: "Acesso total ao sistema" },
    { name: "EDITOR", description: "Gerencia notícias, categorias e tags" },
    { name: "JOURNALIST", description: "Cria e edita próprias notícias" },
  ];
  const roles: Record<string, string> = {};
  for (const r of rolesData) {
    const created = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roles[created.name] = created.id;
    console.log(`✅ Role: ${created.name}`);
  }

  // 3. Usuários
  const usersData = [
    { email: "admin@portal.com", name: "Paulo Dauzacker", role: "ADMIN" },
    { email: "editor@portal.com", name: "Juliana Costa", role: "EDITOR" },
    { email: "jornalista@portal.com", name: "Rafael Oliveira", role: "JOURNALIST" },
  ];

  const seedPassword = process.env.SEED_PASSWORD || "temp-admin-change-me-please";
  const users: Record<string, { id: string; name: string; role: string }> = {};
  for (const u of usersData) {
    const password = await bcrypt.hash(seedPassword, 12);
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: {
        email: u.email,
        password,
        name: u.name,
        roleId: roles[u.role],
        portalId: portal.id,
        active: true,
      },
    });
    users[u.role] = { id: created.id, name: created.name, role: u.role };
    console.log(`✅ Usuário: ${created.email} (${u.role})`);
  }
  // Add a second journalist (reusa a mesma senha dos demais)
  const j2Pass = await bcrypt.hash(seedPassword, 12);
  const journalist2 = await prisma.user.upsert({
    where: { email: "marina@portal.com" },
    update: {},
    create: {
      email: "marina@portal.com",
      password: j2Pass,
      name: "Marina Fernandes",
      roleId: roles["JOURNALIST"],
      portalId: portal.id,
      active: true,
    },
  });
  console.log(`✅ Usuário: ${journalist2.email} (JOURNALIST)`);

  const authorMap: Record<string, string> = {
    ADMIN: users["ADMIN"]!.id,
    EDITOR: users["EDITOR"]!.id,
    JOURNALIST: users["JOURNALIST"]!.id,
  };

  // 4. Categorias
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug_portalId: { slug: cat.slug, portalId: portal.id } },
      update: { name: cat.name, description: cat.description, order: cat.order, active: true },
      create: { ...cat, portalId: portal.id, active: true },
    });
    categoryMap[cat.slug] = created.id;
    console.log(`✅ Categoria: ${cat.name}`);
  }

  // 5. Tags
  const tagMap: Record<string, string> = {};
  for (const tag of TAGS) {
    const created = await prisma.tag.upsert({
      where: { slug_portalId: { slug: tag.slug, portalId: portal.id } },
      update: {},
      create: { ...tag, portalId: portal.id },
    });
    tagMap[tag.slug] = created.id;
    console.log(`✅ Tag: ${tag.name}`);
  }

  // 6. Limpar notícias antigas (para permitir re-seed sem migrate reset)
  await prisma.newsTag.deleteMany({});
  await prisma.news.deleteMany({});

  // 7. Notícias
  for (const item of NEWS) {
    const publishedAt = item.status === "PUBLISHED" ? daysAgo(item.daysAgo ?? 7) : null;
    const createdAt = daysAgo(item.daysAgo ?? 7);

    const news = await prisma.news.create({
      data: {
        title: item.title,
        slug: generateSlug(item.title),
        excerpt: item.excerpt,
        content: item.content,
        coverImage: null,
        coverImageAlt: null,
        status: item.status,
        publishedAt,
        authorId: authorMap[item.authorRole],
        categoryId: categoryMap[item.categorySlug],
        portalId: portal.id,
        views: item.views ?? 0,
        seoTitle: item.title,
        seoDescription: item.excerpt,
        seoKeywords: item.tagSlugs.join(", "),
        isFeatured: item.isFeatured ?? false,
        isBreaking: item.isBreaking ?? false,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Associar tags
    for (const tagSlug of item.tagSlugs) {
      const tagId = tagMap[tagSlug];
      if (tagId) {
        await prisma.newsTag.create({
          data: { newsId: news.id, tagId },
        });
      }
    }

    const statusIcon =
      item.status === "PUBLISHED" ? "📰" :
      item.status === "DRAFT" ? "📝" : "📦";
    console.log(`${statusIcon} Notícia: ${item.title.substring(0, 60)}... [${item.status}]`);
  }

  // ─── Summary ───────────────────────────────────────────────────────
  const counts = {
    portals: await prisma.portal.count(),
    users: await prisma.user.count(),
    roles: await prisma.role.count(),
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
    news: await prisma.news.count(),
    newsTags: await prisma.newsTag.count(),
  };

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Seed concluído com sucesso!");
  console.log("=".repeat(50));
  console.log(`   Portais:     ${counts.portals}`);
  console.log(`   Usuários:    ${counts.users}`);
  console.log(`   Roles:       ${counts.roles}`);
  console.log(`   Categorias:  ${counts.categories}`);
  console.log(`   Tags:        ${counts.tags}`);
  console.log(`   Notícias:    ${counts.news}`);
  console.log(`   Tags assoc.: ${counts.newsTags}`);
  console.log("=".repeat(50));
  console.log("\n📋 Credenciais (senha definida via SEED_PASSWORD ou 'temp-admin-change-me-please'):");
  console.log("   Admin:      admin@portal.com");
  console.log("   Editor:     editor@portal.com");
  console.log("   Jornalista: jornalista@portal.com");
  console.log("   Jornalista: marina@portal.com");
}

main()
  .catch((e) => {
    console.error("\n❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
