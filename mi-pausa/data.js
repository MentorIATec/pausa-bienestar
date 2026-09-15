export const zones = [
  { id: 'red', title: 'Con tensión', energy: 'Más energía', pleasantness: 'Desagradable', feelings: [
    ['Preocupación', 'Algo que podría ocurrir ocupa mi atención.'],
    ['Frustración', 'Algo que me importa no está saliendo como esperaba.'],
    ['Enojo', 'Percibo una injusticia, un obstáculo o un límite que se ha cruzado.'],
    ['Nervios', 'Siento inquietud o activación ante lo que viene.'],
  ] },
  { id: 'yellow', title: 'Con energía agradable', energy: 'Más energía', pleasantness: 'Agradable', feelings: [
    ['Entusiasmo', 'Tengo ganas de involucrarme en algo.'],
    ['Alegría', 'Estoy disfrutando algo que me hace bien.'],
    ['Orgullo', 'Reconozco un esfuerzo o un logro que valoro.'],
    ['Esperanza', 'Veo posibilidades en lo que está por venir.'],
  ] },
  { id: 'blue', title: 'Con poca energía', energy: 'Menos energía', pleasantness: 'Desagradable', feelings: [
    ['Tristeza', 'Algo me duele, me hace falta o lo vivo como una pérdida.'],
    ['Desánimo', 'Me cuesta encontrar ganas para lo que sigue.'],
    ['Soledad', 'Echo de menos sentir conexión con alguien.'],
    ['Decepción', 'Algo importante no fue como lo esperaba.'],
  ] },
  { id: 'green', title: 'Con tranquilidad', energy: 'Menos energía', pleasantness: 'Agradable', feelings: [
    ['Calma', 'Siento tranquilidad en este momento.'],
    ['Satisfacción', 'Reconozco algo que salió bien o que es suficiente para mí.'],
    ['Gratitud', 'Valoro algo que recibí, viví o tengo.'],
    ['Alivio', 'Algo que me pesaba ha disminuido.'],
  ] },
];
export const definitions = Object.fromEntries(zones.flatMap(zone => zone.feelings));
export const reasons = ['Descanso o energía', 'Una tarea o evaluación', 'Algo que pasó', 'Algo que espero', 'Una relación', 'Un logro o avance', 'Una preocupación económica', 'Mi entorno'];
export const needs = [
  { name: 'Claridad', hint: 'Entender qué se espera o por dónde empezar.', actions: ['Pedir un ejemplo o una aclaración', 'Definir el primer paso de mi tarea'] },
  { name: 'Descanso', hint: 'Recuperar energía o bajar el ritmo.', actions: ['Hacer una pausa breve cuando sea posible', 'Reservar un momento de descanso hoy'] },
  { name: 'Compañía', hint: 'Sentir conexión con alguien.', actions: ['Acercarme a alguien de confianza', 'Proponer trabajar con alguien'] },
  { name: 'Espacio personal', hint: 'Tener un momento con menos demandas.', actions: ['Pedir unos minutos para mí', 'Buscar un lugar con menos estímulos'] },
  { name: 'Movimiento', hint: 'Cambiar de postura o activar el cuerpo.', actions: ['Estirarme un momento si me es posible', 'Caminar en el próximo descanso'] },
  { name: 'Apoyo', hint: 'Contar con ayuda para algo concreto.', actions: ['Pedir ayuda con algo concreto', 'Hablar con mi mentor o mentora'] },
  { name: 'Reconocer un avance', hint: 'Dar valor a algo que hice o que me ayudó.', actions: ['Reconocer el esfuerzo que hice', 'Compartir un logro con alguien'] },
  { name: 'Seguir como estoy', hint: 'Cuidar lo que ya me está funcionando.', actions: ['Continuar con lo que me está ayudando', 'Disfrutar este momento sin añadir otra tarea'] },
];
export const dimensions = ['Física', 'Emocional', 'Intelectual', 'Ocupacional', 'Social', 'Espiritual / sentido', 'Financiera'];
export const moments = {
  inicio: { label: 'Al comenzar', title: '¿Cómo llegas hoy?', description: 'Escúchate antes de empezar. Elige qué podría ayudarte con lo que sigue.', reason: '¿Qué puede estar influyendo?', need: '¿Qué te ayudaría para comenzar?' },
  durante: { label: 'Durante el día', title: '¿Cómo estás ahora?', description: 'Haz espacio entre lo que pasó y lo que sigue. No necesitas resolverlo todo.', reason: '¿Qué sigue contigo de lo que ha pasado?', need: '¿Qué te ayudaría para continuar?' },
  cierre: { label: 'Al cerrar', title: '¿Cómo te vas hoy?', description: 'Reconoce lo que viviste, lo que te ayudó y qué quieres cuidar al cerrar.', reason: '¿Qué experiencia del día sigue contigo?', need: '¿Qué te ayudaría al cerrar?' },
};
