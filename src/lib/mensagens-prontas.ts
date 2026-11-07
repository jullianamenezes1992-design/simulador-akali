/**
 * Mensagens prontas de WhatsApp para cada etapa do atendimento (3 por etapa, em sequência).
 * Variáveis: {nome} primeiro nome · {imovel} empreendimento escolhido/recomendado · {link} página do imóvel
 * · {codigo} código da simulação. A corretora pode editar os textos em Mais → Mensagens prontas.
 */

export interface MensagemPronta {
  ordem: 1 | 2 | 3;
  titulo: string;
  texto: string;
}

const A = "\n\n*Corretora Akali*";

export const MENSAGENS_PADRAO: Record<string, MensagemPronta[]> = {
  novo: [
    { ordem: 1, titulo: "Boas-vindas", texto: `Oi, {nome}! Tudo bem? 😊\n\nAqui é da Akali, especialista em *Minha Casa Minha Vida*. Recebi a sua simulação (código {codigo}) e já separei as opções que combinam com o seu perfil.\n\nPodemos conversar agora?${A}` },
    { ordem: 2, titulo: "Mostrar o imóvel", texto: `{nome}, olha o {imovel} que separei para você 👇\n{link}\n\nTem fotos, plantas e localização. Me conta o que achou!${A}` },
    { ordem: 3, titulo: "Convite para conversar", texto: `{nome}, posso te ligar rapidinho para explicar como fica a entrada e a parcela? Leva uns 5 minutinhos. Qual o melhor horário para você? 📞${A}` },
  ],
  em_atendimento: [
    { ordem: 1, titulo: "Retomar a conversa", texto: `Oi, {nome}! Passando para saber se ficou alguma dúvida sobre o {imovel} 😊\n\nEstou à disposição para te ajudar!${A}` },
    { ordem: 2, titulo: "Próximo passo", texto: `{nome}, o próximo passo é bem simples: com seus documentos eu faço a análise de crédito na Caixa, *sem custo e sem compromisso*. Assim você descobre exatamente quanto consegue financiar. Vamos fazer?${A}` },
    { ordem: 3, titulo: "Convite para visita", texto: `{nome}, que tal conhecer o decorado do {imovel}? Ver pessoalmente faz toda a diferença! Me diz o melhor dia que eu já deixo agendado 🏡${A}` },
  ],
  sem_resposta: [
    { ordem: 1, titulo: "Lembrete leve", texto: `Oi, {nome}! Tudo bem? 😊\n\nVi que ainda não conseguimos conversar sobre o {imovel}. Quando puder, me chama aqui que te explico tudinho!${A}` },
    { ordem: 2, titulo: "Gerar interesse", texto: `{nome}, as unidades do {imovel} estão saindo rápido e as condições podem mudar a qualquer momento. Não queria que você perdesse essa oportunidade!\n\nVeja de novo aqui: {link}\n\nConsigo te ajudar ainda hoje?${A}` },
    { ordem: 3, titulo: "Última tentativa", texto: `{nome}, não quero te incomodar 🙏\n\nVou deixar o seu atendimento em aberto. Quando for um bom momento para pensar na casa própria, é só me chamar aqui que eu retomo de onde paramos. Combinado?${A}` },
  ],
  documentacao: [
    { ordem: 1, titulo: "Pedir os documentos", texto: `Oi, {nome}! Para fazer a sua análise de crédito na Caixa, preciso destes documentos (foto pelo WhatsApp mesmo):\n\n📄 RG e CPF (ou CNH)\n📄 Comprovante de estado civil\n📄 Comprovante de residência\n📄 3 últimos holerites ou extrato de renda\n📄 Carteira de trabalho (página da foto e do último registro)\n📄 Extrato do FGTS, se tiver\n\nQualquer dúvida, me chama!${A}` },
    { ordem: 2, titulo: "Lembrete dos documentos", texto: `{nome}, tudo bem? Passando para lembrar dos documentos para a sua análise na Caixa 😊\n\nSe ficar mais fácil, pode mandar aos poucos, do jeito que conseguir. Eu vou conferindo e te aviso se faltar alguma coisa!${A}` },
    { ordem: 3, titulo: "Reforçar a urgência", texto: `{nome}, para garantir as condições atuais do {imovel}, o ideal é darmos entrada na análise o quanto antes. Consegue me enviar os documentos ainda hoje? Se precisar de ajuda para tirar algum, me fala que eu te explico 🙌${A}` },
  ],
  analise_credito: [
    { ordem: 1, titulo: "Análise enviada", texto: `Oi, {nome}! Boa notícia: a sua análise de crédito já foi enviada para a Caixa ✅\n\nAssim que sair o resultado eu te aviso aqui. Fica tranquilo(a)!${A}` },
    { ordem: 2, titulo: "Atualização", texto: `{nome}, passando para te atualizar: a sua análise ainda está em andamento na Caixa. Assim que tiver novidade, você é o primeiro a saber 😊${A}` },
    { ordem: 3, titulo: "Pedir complemento", texto: `{nome}, a Caixa pediu um complemento para seguir com a sua análise. Consegue me enviar [DOCUMENTO]? Com isso já damos sequência!${A}` },
  ],
  serasa_bacen: [
    { ordem: 1, titulo: "Explicar a restrição", texto: `Oi, {nome}! Na análise apareceu uma pendência no seu CPF (Serasa ou Bacen). Isso é mais comum do que parece e, na maioria das vezes, tem solução 🙏\n\nVocê sabe me dizer se tem alguma conta em atraso ou negociação em aberto?${A}` },
    { ordem: 2, titulo: "Como regularizar", texto: `{nome}, o caminho é regularizar a pendência (o app ou site do Serasa costuma ter acordos com desconto). Depois que o nome estiver limpo, refazemos a análise na Caixa.\n\nSe quiser, posso te ajudar a entender o que aparece no seu CPF 😊${A}` },
    { ordem: 3, titulo: "Acompanhar", texto: `{nome}, conseguiu ver a pendência do seu CPF? Assim que regularizar me avisa, que eu já peço uma nova análise. O {imovel} continua sendo uma ótima opção para você!${A}` },
  ],
  aprovado: [
    { ordem: 1, titulo: "Comemorar a aprovação", texto: `{nome}, PARABÉNS! 🎉🏡\n\nO seu crédito foi *aprovado* na Caixa! Agora falta pouco para você conquistar a casa própria. Vamos escolher a sua unidade?${A}` },
    { ordem: 2, titulo: "Escolher a unidade", texto: `{nome}, separei as melhores unidades disponíveis do {imovel} para você escolher (andar, posição e valor). Quando podemos conversar ou ir até o stand? 😊${A}` },
    { ordem: 3, titulo: "Garantir a unidade", texto: `{nome}, a aprovação tem prazo de validade e as unidades estão saindo rápido. Vamos garantir a sua ainda esta semana? Me diz o melhor dia!${A}` },
  ],
  reprovado: [
    { ordem: 1, titulo: "Dar a notícia com cuidado", texto: `Oi, {nome}. Infelizmente, desta vez a Caixa não aprovou o crédito 😔\n\nMas isso não é o fim do sonho! Existem caminhos para tentar de novo e eu quero te ajudar a encontrar o melhor para você.${A}` },
    { ordem: 2, titulo: "Mostrar alternativas", texto: `{nome}, algumas opções que costumam ajudar:\n\n✅ Compor renda com outra pessoa (cônjuge, familiar)\n✅ Usar o FGTS na entrada\n✅ Escolher um imóvel de valor menor\n✅ Organizar a renda e tentar novamente em alguns meses\n\nQuer que eu veja qual delas funciona para você?${A}` },
    { ordem: 3, titulo: "Manter contato", texto: `{nome}, vou deixar o seu cadastro guardado com carinho. Quando a sua situação mudar (renda, emprego, composição), me chama que refazemos a simulação na hora 💙${A}` },
  ],
  visita: [
    { ordem: 1, titulo: "Confirmar a visita", texto: `Oi, {nome}! Confirmando a sua visita ao {imovel} 🏡\n\n📅 [DIA] às [HORÁRIO]\n📍 [ENDEREÇO DO STAND]\n\nTraga RG e CPF. Te espero lá!${A}` },
    { ordem: 2, titulo: "Lembrete no dia", texto: `{nome}, bom dia! Lembrete da nossa visita hoje às [HORÁRIO] no {imovel} 😊\n\nSe precisar remarcar, me avisa por aqui.${A}` },
    { ordem: 3, titulo: "Depois da visita", texto: `{nome}, obrigada pela visita! O que você achou do {imovel}? 😊\n\nSe gostou, já podemos separar a sua unidade e seguir com a análise de crédito.${A}` },
  ],
  proposta: [
    { ordem: 1, titulo: "Enviar a proposta", texto: `Oi, {nome}! Preparei a sua proposta do {imovel} com as condições de entrada e parcelas 📋\n\nDá uma olhada e me diz se ficou bom para você!${A}` },
    { ordem: 2, titulo: "Tirar dúvidas", texto: `{nome}, ficou alguma dúvida sobre a proposta? Se quiser, podemos ajustar a entrada ou o número de parcelas para caber melhor no seu orçamento 😊${A}` },
    { ordem: 3, titulo: "Fechar", texto: `{nome}, as condições da proposta são válidas por pouco tempo e a unidade fica reservada só até [DATA]. Vamos fechar e garantir o seu apartamento? 🏡${A}` },
  ],
  vendido: [
    { ordem: 1, titulo: "Agradecer", texto: `{nome}, PARABÉNS pelo seu novo apartamento! 🎉🔑\n\nFoi um prazer fazer parte dessa conquista. Qualquer coisa que precisar daqui para frente, conte comigo!${A}` },
    { ordem: 2, titulo: "Pedir indicação", texto: `{nome}, você conhece alguém que também sonha com a casa própria? Pode indicar sem compromisso, vou cuidar com o mesmo carinho que cuidei de você 💙\n\nO link da simulação é este: {link}${A}` },
    { ordem: 3, titulo: "Acompanhar a obra", texto: `Oi, {nome}! Passando para saber como você está e se precisa de alguma ajuda com o andamento do {imovel}. Estou sempre por aqui 😊${A}` },
  ],
  perdido: [
    { ordem: 1, titulo: "Reativar", texto: `Oi, {nome}! Quanto tempo! 😊\n\nSurgiram novas condições no Minha Casa Minha Vida e alguns lançamentos com entrada facilitada. Quer que eu refaça a sua simulação?${A}` },
    { ordem: 2, titulo: "Novidade", texto: `{nome}, lembrei de você! Chegou uma oportunidade que combina com o que você procurava 👇\n{link}\n\nQuer saber mais?${A}` },
    { ordem: 3, titulo: "Porta aberta", texto: `{nome}, só passando para dizer que continuo à disposição. Quando quiser retomar o sonho da casa própria, é só me chamar 💙${A}` },
  ],
};

export const VARIAVEIS = [
  { chave: "{nome}", desc: "primeiro nome do cliente" },
  { chave: "{imovel}", desc: "empreendimento escolhido (ou o 1º recomendado)" },
  { chave: "{link}", desc: "link da página do imóvel no site" },
  { chave: "{codigo}", desc: "código da simulação" },
];

export function preencherMensagem(texto: string, v: { nome: string; imovel?: string | null; link?: string | null; codigo?: string | null }) {
  const primeiro = (v.nome || "").trim().split(/\s+/)[0] || "";
  const nome = primeiro ? primeiro[0].toUpperCase() + primeiro.slice(1).toLowerCase() : "tudo bem";
  return texto
    .replaceAll("{nome}", nome)
    .replaceAll("{imovel}", v.imovel || "apartamento")
    .replaceAll("{link}", v.link || "")
    .replaceAll("{codigo}", v.codigo || "")
    .replace(/\n{3,}/g, "\n\n");
}

/** Junta os textos salvos pela corretora com os padrões. */
export function mensagensDaEtapa(status: string, salvas: { status: string; ordem: number; titulo: string; texto: string }[]): MensagemPronta[] {
  const padrao = MENSAGENS_PADRAO[status] ?? [];
  return padrao.map((p) => {
    const s = salvas.find((x) => x.status === status && x.ordem === p.ordem);
    return s ? { ordem: p.ordem, titulo: s.titulo, texto: s.texto } : p;
  });
}
