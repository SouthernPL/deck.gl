import {Renderer} from '../renderer';
import {BufferManager} from '../buffer-manager';
import {CameraManager} from '../camera-manager';
import {FramebufferManager} from '../framebuffer-manager';
import {ProgramManager} from '../program-manager';
import {TextureManager} from '../texture-manager';

import {Triangles, Lines, InstancedSpheres, InstancedTriangleMesh} from '../../mesh';
import {WebGLTriangles, WebGLLines, WebGLInstancedTriangleMesh} from './webgl-renderable-mesh';

import {GL} from '../luma.gl2/webgl2';
import {createGLContext} from 'luma.gl';
import {vec3, vec4, mat4} from 'gl-matrix';

// On screen WebGL renderer
export default class WebGLRenderer extends Renderer {
  constructor({controller, canvas, debug, glOptions}) {
    super({controller, canvas, debug, glOptions});

    try {
      this.glContext = createGLContext({
        canvas: this.currentCanvas,
        debug: debug,
        ...this.contextOptions
      });
      console.log("WebGL context successfully created: ", this.glContext);
    } catch (error) {
      console.log("Context creation failed");
      console.log("error: ", error);
      return;
    }

    // Initial WebGL states
    // These are rendering resource managers.
    this.bufferManager = new BufferManager(this);
    this.textureManager = new TextureManager(this);
    this.programManager = new ProgramManager(this);

    /* We should have a camera manager here to handle all abstract camera from the container class.
    More importantly, we should have auxillary cameras for rendering advanced effects like shadows.
    It's not implemented yet. Right now, the renderer just take abstract camera from the container class.
    */

    this.cameraManager = new CameraManager(this);
    this.framebufferManager = new FramebufferManager(this);
  }

  /* Generate renderable mesh from abstract mesh.
  Basically a switch statment right now.
  Most of the work are delegated to each RenderableMesh's constructor
  But eventually it will involve significant work in transforming
  abstract mesh to renderable mesh.

  This is the primary place that the user uses GPU compute to
  accelerate data transformation and mesh generation. If the user
  choose to do GPU compute here, he can use the existing drawing
  context and keep the outputs on the GPU.

  Note: abstract mesh does not need to be a 1-on-1 match with
  renderable match */

  generateRenderableMeshes(mesh) {
    let currentRenderableMesh;
    if (mesh instanceof Triangles) {
      currentRenderableMesh = new WebGLTriangles({
        triangles: mesh,
        renderer: this
      });
    } else if (mesh instanceof Lines) {
      currentRenderableMesh = new WebGLLines({
        lines: mesh,
        renderer: this
      });
    } else if (mesh instanceof InstancedSpheres) {
      currentRenderableMesh = new WebGLInstancedTriangleMesh({
        instancedTriangleMesh: mesh,
        renderer: this
      });
    } else if (mesh instanceof InstancedTriangleMesh) {
      currentRenderableMesh = new WebGLInstancedTriangleMesh({
        instancedTriangleMesh: mesh,
        renderer: this
      });
    } else {
      console.log('WebGLRenderer.generateRenderableMeshes(). Unknown type of mesh!')
    }
    return currentRenderableMesh;
  }
}
