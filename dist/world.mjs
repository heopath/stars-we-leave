export const WORLD = {width:1600,height:1100};
export const LANDMARKS = [{x:390,y:470},{x:1130,y:350},{x:1050,y:870}];
export const SPAWN = {x:690,y:710};
export function clampPoint(p) {
  return {x:Math.max(60,Math.min(WORLD.width-60,p.x)),y:Math.max(90,Math.min(WORLD.height-60,p.y))};
}
export function cameraFor(player,width,height) {
  const zoom=width<=760?.7:.9;
  return {x:player.x-width/2/zoom,y:player.y-height*.57/zoom,zoom};
}
export function project(p,camera) {return {x:(p.x-camera.x)*camera.zoom,y:(p.y-camera.y)*camera.zoom};}
export function unproject(p,camera) {return clampPoint({x:p.x/camera.zoom+camera.x,y:p.y/camera.zoom+camera.y});}
export function walk(player,vector,dt,speed=300) {
  const length=Math.hypot(vector.x,vector.y); if(!length)return {...player};
  const distance=Math.min(Math.max(0,dt),.05)*speed;
  return clampPoint({x:player.x+vector.x/length*distance,y:player.y+vector.y/length*distance});
}
