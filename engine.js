import 'https://cdn.babylonjs.com/babylon.js';
import 'https://cdn.babylonjs.com/loaders/babylonjs.loaders.js';

let scene;
// Функция для превращения RGB в BABYLON.Color3
const getColor = (r, g, b) => new BABYLON.Color3(r/255, g/255, b/255);
// Создания вектора (BABYLON.Vector3) на основе трех чисел 
const getVector = (x, y, z) => new BABYLON.Vector3(x, y, z);
// Создание и настройка сцены, камеры, света
const createWorld = async (canvas, debugMode = false) => {
  // Стандартные функция для базовой настройки сцены
  let engine = new BABYLON.Engine(canvas);    
  scene = new BABYLON.Scene(engine);
  scene.clearColor = getColor(237, 225, 166);   
  // Создание камеры и света по умолчанию. Параметры boolean, поочереди:
  // (создать вращающуюся камеры (true, или обычную камеру - false), сделать эту камеру основной, прикрепить к canvas для управления)
  scene.createDefaultCameraOrLight(debugMode, true, debugMode);
  // Создание окружения по умолчанию, без поверхности и неба
  scene.createDefaultEnvironment({createSkybox: false, createGround: false});
  if(window.screen.width > window.screen.height){
    scene.activeCamera.position = new BABYLON.Vector3(0, 15, -15);
  }else{
    scene.activeCamera.position = new BABYLON.Vector3(0, 20, -22);
  }
  
  scene.activeCamera.setTarget(new BABYLON.Vector3(0, 0, 8));
  engine.runRenderLoop(() => scene.render());
  return scene;
}
// Создает boundingBox для главного меша (player)
const createBound = (bound) => {
  let boundingBox = new BABYLON.MeshBuilder.CreateBox('name', {
    width: bound.size.x,
    height: bound.size.y,
    depth: bound.size.z
  },scene);
  boundingBox.hasVertexAlpha = true;
  (bound.visibility) ? boundingBox.visibility = 0.5 : boundingBox.visibility = 0;
  return boundingBox;
}
// Загружает ассеты
// Второй параметры овечает за создание boundingBox - {size: BABYLON.Vector3, visibility: boolean}
const loadAsset = async (assetFilename, bound = null) => {
  let result = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    'assets/',
    assetFilename,
    scene
  );
  let mesh = null;
  if(bound){
    let model = result.meshes[0];
    mesh = createBound(bound);  
    model.position.y = -bound.size.y/2;
    model.parent = mesh; 
    mesh.position.y = bound.size.y/2;
  }
  else {
    mesh = result.meshes[0];
  }
  return mesh;
}
// Передвигает меш в соответствии с указанным вектором
const moveMesh = (mesh, position) => mesh.translate(position, 1, BABYLON.Space.WORLD); 
// Позиционирует обьект в соответствии с указанным вектором
const locateMesh = (mesh, position) => mesh.position = position; 
// Функции-обертки для рандома
const getRandom = (min, max) => Math.round(Math.random() * (max - min) + min);
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;
// Создает коробку на основе указанных размеров и позиции
const createBox = (size, position, alpha = 0) => {
  let box = BABYLON.MeshBuilder.CreateBox('box', {
    width: size.x,
    height: size.y,
    depth: size.z
  }, scene);
  box.position = position;
  box.hasVertexAlpha = true;
  box.visibility = alpha;
  return box;
}

// Генерирует двустороннюю линию из мешей, на основе указанных параметров
const addTwoSideLineElement = (baseArray, objectArray, sideVariable, count, 
  horizontalOffset, forwardOffset, needEndPosition = true  
) => {
  // Получаем позицию по Z последнее элемента в массиве
  let lastPositionZ = (baseArray.length > 0)
    ? baseArray[baseArray.length - 1].position.z
    : 15;
  // Получаем тип меша, который будем ставить на позицию
  let type = getRandom(0, count - 1);
  // Создаем меш, на основе массива с протипами
  let object = objectArray[type].clone();
  // Генерируем позицию, на основе переданных параметров
  let position = getVector(sideVariable * horizontalOffset, 0, lastPositionZ + 15 + (type*forwardOffset + 5));
  locateMesh(object, position);
  baseArray.push(object);
  if(needEndPosition){
    let endPosition =  getVector(position.x, position.y, position.z + (type*5));
    sideVariable *= -1;
    return {sideVariable, endPosition};
  } else {
    return sideVariable *= -1;
  }
}

export {createWorld, loadAsset, getVector, moveMesh, locateMesh, 
  getRandom, getColor, createBox, addTwoSideLineElement
};