import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Start initialisation processes.
 *
 * @see {@link https://threejs.org/docs/#api/en/loaders/Cache|Cache}
 * @see {@link https://threejs.org/docs/index.html#api/en/loaders/managers/DefaultLoadingManager|DefaultLoadingManager}
 */
(function () {
  // Enable cache.
  THREE.Cache.enabled = true;

  // Create a loading manager container element.
  const element = document.createElement("div");
  element.style.position = "fixed";
  element.style.color = "white";
  element.style.backgroundColor = "black";
  element.style.top = 0;
  element.style.left = 0;
  element.style.width = "100%";
  element.style.textAlign = "center";
  element.style.display = "none";
  element.style.padding = "0.25em";
  element.style.fontFamily = "sans-serif";
  element.style.fontSize = "0.75em";
  element.classList.add("loading-manager");
  document.getElementsByTagName("body")[0].appendChild(element);

  // Set up default loading manager object.
  THREE.DefaultLoadingManager.onStart = function (url, loaded, total) {
    element.innerHTML = "Starting: " + url + " [" + loaded + "/" + total + "]";
    element.style.display = "block";
  };
  THREE.DefaultLoadingManager.onLoad = function () {
    element.innerHTML = "";
    element.style.display = "none";
  };
  THREE.DefaultLoadingManager.onProgress = function (url, loaded, total) {
    element.innerHTML = "Loading: " + url + " [" + loaded + "/" + total + "]";
    element.style.display = "block";
  };
  THREE.DefaultLoadingManager.onError = function (url) {
    element.innerHTML = "Error: " + url;
    element.style.display = "block";
  };
})();

/**
 * Check for WebGL2 support on the current browser.
 *
 * @returns {Boolean} Return true if the browser supports WebGL2; return false otherwise.
 *
 * @see {@link https://threejs.org/docs/#manual/en/introduction/WebGL-compatibility-check|WebGL compatibility check}
 */
export function isSupported() {
  if (!WebGL.isWebGL2Available()) {
    const element = document.createElement("div");
    element.style.position = "fixed";
    element.style.bottom = 0;
    element.style.right = 0;
    element.classList.add("webgl2-unsupported");
    element.appendChild(WebGL.getWebGL2ErrorMessage());
    document.getElementsByTagName("body")[0].appendChild(element);
    return false;
  }
  return true;
}

/**
 * Set the scene background.
 *
 * @param {Object} options
 * @param {Number} options.color Default background color regardless of color scheme.
 * @param {Number} options.dark Background color for the dark color scheme.
 * @param {Number} options.light Background color for the light color scheme.
 * @param {String} options.image Background image URL in JPEG or PNG format.
 * @param {String} options.hdr Background image URL in HDR format.
 * @param {String} options.exr Background image URL in EXR format.
 * @param {THREE.Scene} options.scene Scene object.
 *
 * @see {@link https://threejs.org/docs/#api/en/scenes/Scene|Scene}
 * @see {@link https://threejs.org/docs/#api/en/loaders/TextureLoader|TextureLoader}
 */
export function setBackground({
  color = 0x666666,
  dark = undefined,
  light = undefined,
  image = undefined,
  hdr = undefined,
  exr = undefined,
  scene = undefined,
}) {
  if (scene instanceof THREE.Scene) {
    if (typeof dark !== "undefined" && typeof light !== "undefined") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        scene.background = new THREE.Color(dark);
      } else {
        scene.background = new THREE.Color(light);
      }
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function (event) {
          if (event.matches) {
            scene.background = new THREE.Color(dark);
          } else {
            scene.background = new THREE.Color(light);
          }
        });
    } else if (typeof image !== "undefined") {
      new THREE.TextureLoader().load(image, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
      });
    } else if (typeof hdr !== "undefined") {
      new RGBELoader().load(hdr, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
      });
    } else if (typeof exr !== "undefined") {
      new EXRLoader().load(exr, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
      });
    } else {
      scene.background = new THREE.Color(color);
    }
  } else {
    console.error("Invalid options for 'setBackground' function.");
  }
}

/**
 * A callback definition to set the canvas style width and height on screen
 * resize and orientation change (responsive).
 *
 * @callback canvasResponsiveCallback
 * @param {HTMLElement} canvas Canvas element to resize.
 *
 * @example
 * function (canvas) {
 *   // Set aspect ratio 4:1
 *   canvas.style.width = "100%";
 *   canvas.style.height = canvas.clientWidth / 4 + "px";
 * }
 */

/**
 * Set canvas element to be responsive.
 *
 * @param {Object} options
 * @param {HTMLElement} options.canvas Canvas element.
 * @param {THREE.WebGLRenderer} options.renderer Renderer object.
 * @param {(THREE.PerspectiveCamera|THREE.OrthographicCamera)} options.camera Camera object.
 * @param {canvasResponsiveCallback} options.responsive Canvas responsive callback.
 *
 * @see {@link https://threejs.org/manual/#en/responsive|Responsive Design}
 */
export function setResponsive({
  canvas = undefined,
  renderer = undefined,
  camera = undefined,
  responsive = function (canvas) {
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  },
}) {
  if (
    canvas instanceof HTMLElement &&
    renderer instanceof THREE.WebGLRenderer &&
    (camera instanceof THREE.PerspectiveCamera ||
      camera instanceof THREE.OrthographicCamera) &&
    typeof responsive === "function"
  ) {
    const resizeChange = function () {
      responsive(canvas);
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resizeChange);
    screen.orientation.addEventListener("change", resizeChange);
  } else {
    console.error("Invalid options for 'setResponsive' function.");
  }
}

/**
 * A callback definition to animate an object/element in the scene.
 *
 * @callback animationCallback
 * @param {*} element Object/element to animate.
 * @param {Number} delta Delta time.
 *
 * @example
 * function (element, delta) {
 *   // Rotate in Y axis.
 *   element.rotation.y += 0.05;
 * }
 */

/**
 * A list of registered objects. A registered object contains elements to
 * animate and their animation callback.
 *
 * @type {{element: *, animate: animationCallback}[]}
 */
export const animationList = [];

/**
 * Render a text.
 *
 * @async
 * @param {Object} options
 * @param {String} options.text Text to render.
 * @param {String} options.font JSON formatted font typeface file URL.
 * @param {Number} options.size Size of text.
 * @param {Number} options.depth Depth of text.
 * @param {Boolean} options.flat If true, disregard depth and render flat 2D text.
 * @param {Number} options.curveSegments Number of points on the curves.
 * @param {Boolean} options.bevelEnabled Turn the font bevel on or off.
 * @param {Number} options.bevelThickness Font bevel thickness.
 * @param {Number} options.bevelSize Font bevel size.
 * @param {Number} options.bevelOffset Font bevel offset distance.
 * @param {Number} options.bevelSegments Number of bevel segments.
 * @param {Number} options.color Color of text.
 * @param {Number} options.scaleX Scale in X coordinate.
 * @param {Number} options.scaleY Scale in Y coordinate.
 * @param {Number} options.scaleZ Scale in Z coordinate.
 * @param {Number} options.posX X coordinate position.
 * @param {Number} options.posY Y coordinate position.
 * @param {Number} options.posZ Z coordinate position.
 * @param {THREE.Scene} options.scene Scene object.
 * @param {animationCallback} options.animate Animation callback.
 * @returns {THREE.Mesh} Text object.
 *
 * @see {@link https://threejs.org/docs/#examples/en/loaders/FontLoader|FontLoader}
 * @see {@link https://threejs.org/docs/#api/en/geometries/ShapeGeometry|ShapeGeometry}
 * @see {@link https://threejs.org/docs/#examples/en/geometries/TextGeometry|TextGeometry}
 */
export async function renderText({
  text = "Hello, World!",
  font = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json",
  size = 10,
  depth = 3,
  flat = false,
  curveSegments = 12,
  bevelEnabled = false,
  bevelThickness = 1,
  bevelSize = 1,
  bevelOffset = 0,
  bevelSegments = 12,
  color = 0xffffff,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  posX = undefined,
  posY = 0,
  posZ = 0,
  scene = undefined,
  animate = undefined,
}) {
  const loaded = new Promise(function (resolve) {
    new FontLoader().load(font, async function (loadedFont) {
      let geometry, material;
      if (flat === true) {
        const shapes = loadedFont.generateShapes(text, size);
        geometry = new THREE.ShapeGeometry(shapes);
        material = new THREE.MeshBasicMaterial({
          color,
          side: THREE.DoubleSide,
        });
      } else {
        geometry = new TextGeometry(text, {
          font: loadedFont,
          size,
          depth,
          curveSegments,
          bevelEnabled,
          bevelThickness,
          bevelSize,
          bevelOffset,
          bevelSegments,
        });
        material = [
          new THREE.MeshPhongMaterial({
            flatShading: true,
            color,
          }),
          new THREE.MeshPhongMaterial({ color }),
        ];
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(scaleX, scaleY, scaleZ);
      geometry.computeBoundingBox();
      posX =
        typeof posX === "undefined"
          ? -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x)
          : posX;
      mesh.position.set(posX, posY, posZ);
      if (typeof animate === "function") {
        animationList.push({
          element: mesh,
          animate,
        });
      }
      if (scene instanceof THREE.Scene) {
        scene.add(mesh);
      }
      resolve(mesh);
    });
  });
  return loaded;
}

/**
 * A callback definition to render a 2D/flat shape procedurally (manually).
 *
 * @callback drawShapeCallback
 * @param {THREE.Shape} shape Shape object.
 *
 * @example
 * function (shape) {
 *   // Triangle
 *   shape.moveTo(80, 20);
 *   shape.lineTo(40, 80);
 *   shape.lineTo(120, 80);
 *   shape.lineTo(80, 20);
 * }
 */

/**
 * Render a flat 2D shape.
 *
 * @param {Object} options
 * @param {Number} options.radius For regular polygon. Circle radius.
 * @param {Number} options.segments For regular polygon. Number of segments (3 for triangle, 4 for square, 6 for hexagon, etc).
 * @param {Number} options.innerRadius For regular polygon. Ring plane inner radius.
 * @param {Number} options.phiSegments For regular polygon. Number of phi segments.
 * @param {Number} options.thetaStart For regular polygon. Starting angle (between 0 and 2).
 * @param {Number} options.thetaLength For regular polygon. Central angle (between 0 and 2).
 * @param {Number} options.width For plane geometry. Width of the plane.
 * @param {Number} options.height For plane geometry. Height of the plane.
 * @param {Number} options.widthSegments For plane geometry. Number of segments on the width direction.
 * @param {Number} options.heightSegments For plane geometry. Number of segments on the height direction.
 * @param {drawShapeCallback} options.shape For any other shape, draw a shape procedurally using a callback function.
 * @param {Number} options.color Color of shape.
 * @param {String} options.texture Texture URL. Replace color.
 * @param {Number} options.scaleX Scale in X coordinate.
 * @param {Number} options.scaleY Scale in Y coordinate.
 * @param {Number} options.scaleZ Scale in Z coordinate.
 * @param {Number} options.posX X coordinate position.
 * @param {Number} options.posY Y coordinate position.
 * @param {Number} options.posZ Z coordinate position.
 * @param {THREE.Scene} options.scene Scene object.
 * @param {animationCallback} options.animate Animation callback.
 * @returns {THREE.Mesh} Shape object.
 *
 * @see {@link https://threejs.org/docs/#api/en/geometries/ShapeGeometry|ShapeGeometry}
 * @see {@link https://threejs.org/docs/#api/en/geometries/RingGeometry|RingGeometry} For regular polygon.
 * @see {@link https://threejs.org/docs/#api/en/geometries/PlaneGeometry|PlaneGeometry} For plane geometry.
 * @see {@link https://threejs.org/docs/#api/en/geometries/ShapeGeometry|ShapeGeometry} For any other shape.
 */
export function renderShape({
  radius = undefined,
  segments = 128,
  innerRadius = 0,
  phiSegments = 1,
  thetaStart = 0,
  thetaLength = 2,
  width = undefined,
  height = undefined,
  widthSegments = 1,
  heightSegments = 1,
  shape = undefined,
  color = 0xffffff,
  texture = undefined,
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  posX = 0,
  posY = 0,
  posZ = 0,
  scene = undefined,
  animate = undefined,
}) {
  let geometry, material;
  if (typeof radius === "number") {
    geometry = new THREE.RingGeometry(
      innerRadius,
      radius,
      segments,
      phiSegments,
      thetaStart * Math.PI,
      thetaLength * Math.PI
    );
  } else if (typeof width === "number" && typeof height === "number") {
    geometry = new THREE.PlaneGeometry(
      width,
      height,
      widthSegments,
      heightSegments
    );
  } else if (typeof shape === "function") {
    const flatShape = new THREE.Shape();
    shape(flatShape);
    geometry = new THREE.ShapeGeometry(flatShape);
    const position = geometry.attributes.position;
    const box3 = new THREE.Box3().setFromBufferAttribute(position);
    const size = new THREE.Vector3();
    box3.getSize(size);
    const uv = [];
    const vector2 = new THREE.Vector2();
    for (let i = 0; i < position.count; i++) {
      vector2.fromBufferAttribute(position, i);
      vector2.sub(box3.min).divide(size);
      uv.push(vector2.x, vector2.y);
    }
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  } else {
    radius = 10;
    geometry = new THREE.CircleGeometry(
      radius,
      segments,
      thetaStart * Math.PI,
      thetaLength * Math.PI
    );
  }

  if (typeof texture === "string") {
    const image = new THREE.TextureLoader().load(texture);
    image.colorSpace = THREE.SRGBColorSpace;
    material = new THREE.MeshBasicMaterial({
      map: image,
      side: THREE.DoubleSide,
    });
  } else {
    material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(scaleX, scaleY, scaleZ);
  mesh.position.set(posX, posY, posZ);
  if (typeof animate === "function") {
    animationList.push({
      element: mesh,
      animate,
    });
  }
  if (scene instanceof THREE.Scene) {
    scene.add(mesh);
  }
  return mesh;
}

/**
 * Render a box.
 *
 * @param {Object} options
 * @param {Number} options.width Width of the box.
 * @param {Number} options.height Height of the box.
 * @param {Number} options.depth Depth of the box.
 * @param {Number} options.widthSegments Number of segments along the width.
 * @param {Number} options.heightSegments Number of segments along the height.
 * @param {Number} options.depthSegments Number of segments along the depth.
 * @param {Number} options.color Color of box.
 * @param {Boolean} options.isSolid If true, render a solid box instead of a line frame.
 * @param {String[]} options.textures Array of texture URLs.
 * @param {Number} options.scaleX Scale in X coordinate.
 * @param {Number} options.scaleY Scale in Y coordinate.
 * @param {Number} options.scaleZ Scale in Z coordinate.
 * @param {Number} options.posX X coordinate position.
 * @param {Number} options.posY Y coordinate position.
 * @param {Number} options.posZ Z coordinate position.
 * @param {THREE.Scene} options.scene Scene object.
 * @param {animationCallback} options.animate Animation callback.
 * @returns {(THREE.Mesh|THREE.LineSegments)} Box object.
 *
 * @see {@link https://threejs.org/docs/#api/en/geometries/BoxGeometry|BoxGeometry}
 */
export function renderBox({
  width = 10,
  height = 10,
  depth = 10,
  widthSegments = 1,
  heightSegments = 1,
  depthSegments = 1,
  color = 0xffffff,
  isSolid = true,
  textures = [],
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  posX = 0,
  posY = 0,
  posZ = 0,
  scene = undefined,
  animate = undefined,
}) {
  const geometry = new THREE.BoxGeometry(
    width,
    height,
    depth,
    widthSegments,
    heightSegments,
    depthSegments
  );
  let box;
  if (isSolid === true) {
    if (Array.isArray(textures) && textures.length > 0) {
      const materials = [];
      const textureToLoad = Array(6).fill(textures).flat();
      const textureLoader = function (path) {
        const texture = new THREE.TextureLoader().load(path);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };
      for (let i = 0; i < textureToLoad.length; i++) {
        materials.push(
          new THREE.MeshBasicMaterial({
            map: textureLoader(textureToLoad[i]),
          })
        );
      }
      box = new THREE.Mesh(geometry, materials);
    } else {
      box = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }));
    }
  } else {
    box = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color })
    );
  }

  box.scale.set(scaleX, scaleY, scaleZ);
  box.position.set(posX, posY, posZ);
  if (typeof animate === "function") {
    animationList.push({
      element: box,
      animate,
    });
  }
  if (scene instanceof THREE.Scene) {
    scene.add(box);
  }
  return box;
}

/**
 * Render a GL Transmission Format (GLTF) model.
 *
 * @async
 * @param {Object} options
 * @param {Number} options.model GLTF model URL.
 * @param {Number} options.scaleX Scale in X coordinate.
 * @param {Number} options.scaleY Scale in Y coordinate.
 * @param {Number} options.scaleZ Scale in Z coordinate.
 * @param {Number} options.posX X coordinate position.
 * @param {Number} options.posY Y coordinate position.
 * @param {Number} options.posZ Z coordinate position.
 * @param {THREE.Scene} options.scene Scene object.
 * @param {animationCallback} options.animate Animation callback.
 * @returns {Object} Model object.
 *
 * @see {@link https://threejs.org/docs/#examples/en/loaders/GLTFLoader|GLTFLoader}
 * @see {@link https://threejs.org/docs/#api/en/animation/AnimationMixer|AnimationMixer}
 */
export async function renderGltfModel({
  model = "",
  scaleX = 1,
  scaleY = 1,
  scaleZ = 1,
  posX = 0,
  posY = 0,
  posZ = 0,
  scene = undefined,
  animate = undefined,
}) {
  const loaded = new Promise(function (resolve) {
    new GLTFLoader().load(model, async function (loadedModel) {
      if (typeof animate === "function") {
        if (loadedModel.animations) {
          const mixer = new THREE.AnimationMixer(loadedModel.scene);
          loadedModel.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
          loadedModel.mixer = mixer;
        }
        animationList.push({
          element: loadedModel,
          animate,
        });
      }

      loadedModel.scene.scale.set(scaleX, scaleY, scaleZ);
      loadedModel.scene.position.set(posX, posY, posZ);
      if (scene instanceof THREE.Scene) {
        scene.add(loadedModel.scene);
      }
      resolve(loadedModel);
    });
  });
  return loaded;
}
