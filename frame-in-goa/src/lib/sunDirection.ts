import * as THREE from 'three';

/** Shared low, warm golden-hour sun direction — bright enough to read the
 * scene clearly, low enough to paint everything in orange/gold. Used by the
 * sky, directional light and the sea's specular sun-glints so they all agree
 * on where the sun actually is. */
export const SUN_DIRECTION = new THREE.Vector3(0.78, 0.22, 0.26).normalize();
