/**
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState, FunctionComponent, useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, Button, View, Text, ViewProps, Image } from 'react-native';

import { EngineView, useEngine, EngineViewCallbacks } from '@babylonjs/react-native';
import BABYLON,{
  Scene, Vector3, ArcRotateCamera, Camera, WebXRSessionManager, SceneLoader, TransformNode, DeviceSourceManager, DeviceType, DeviceSource, PointerInput, WebXRTrackingState, Nullable, Mesh, SphereBuilder,  Color3, Quaternion, StandardMaterial, DynamicTexture, PointerEventTypes, FreeCamera,  HemisphericLight, 
  WebXRBackgroundRemover, WebXRHitTest, WebXRAnchorSystem, TouchCamera,
} from '@babylonjs/core';
import '@babylonjs/loaders';

import Slider from '@react-native-community/slider';

const EngineScreen: FunctionComponent<ViewProps> = (props: ViewProps) => {
  const defaultScale = 1;
  const enableSnapshots = false;

  const engine = useEngine();
  const [toggleView, setToggleView] = useState(false);
  const [camera, setCamera] = useState<Camera>();
  const [rootNode, setRootNode] = useState<TransformNode>();
  const [scene, setScene] = useState<Scene>();
  const [xrSession, setXrSession] = useState<WebXRSessionManager>();
  const [scale, setScale] = useState<number>(defaultScale);
  const [snapshotData, setSnapshotData] = useState<string>();
  const [engineViewCallbacks, setEngineViewCallbacks] = useState<EngineViewCallbacks>();
  const [trackingState, setTrackingState] = useState<WebXRTrackingState>();

  useEffect(() => {
    if (engine) {
      const scene = new Scene(engine);
      setScene(scene);
      scene.createDefaultLight(true);

      var camera = new FreeCamera(
        "myCamera",
        new Vector3(0, 1, -5),
        scene
      );

      camera.setTarget(Vector3.Zero());
      setCamera(camera);


      const rootNode = new TransformNode('Root Container', scene);
      setRootNode(rootNode);

      engine.runRenderLoop(function () {
        scene.render();
      });

    }
  }, [engine]);


  const trackingStateToString = (trackingState: WebXRTrackingState | undefined) : string => {
    return trackingState === undefined ? '' : WebXRTrackingState[trackingState];
  };

  const onToggleXr = useCallback(() => {
    (async () => {
      console.warn("====");
      if (xrSession) {
        console.warn("===111");
        await xrSession.exitXRAsync();
      } else {
        if (rootNode !== undefined && scene !== undefined) {
          const xr = await scene.createDefaultXRExperienceAsync({
            disableDefaultUI: true,
            disableTeleportation: true,
          })
          const session = await xr.baseExperience.enterXRAsync('immersive-ar', 'unbounded', xr.renderTarget);
          setXrSession(session);
          session.onXRSessionEnded.add(() => {
            setXrSession(undefined);
            setTrackingState(undefined);
          })

          let lastHitTest = null as any;  

          scene.onPointerObservable.add(async (eventData) => {
            if (lastHitTest) {
              if (lastHitTest.xrHitResult.createAnchor) {
                // 添加锚
                const anchor = await anchorSystem.addAnchorPointUsingHitTestResultAsync(
                  lastHitTest
                );
              } else {
                processClick();
              }
            }
          }, PointerEventTypes.POINTERDOWN);

          const pairs = [] as any[];
          const fm = xr.baseExperience.featuresManager;

          fm.enableFeature(WebXRBackgroundRemover);
          const hitTest = fm.enableFeature(WebXRHitTest, "latest") as WebXRHitTest;
          const anchorSystem = fm.enableFeature(
            WebXRAnchorSystem,
            "latest"
          ) as WebXRAnchorSystem;

          // 处理点初始化
          const dot = SphereBuilder.CreateSphere(
            "dot",
            {
              diameter: 0.05,
            },
            scene
          );
          dot.rotationQuaternion = new Quaternion();

          const dotMaterial = new StandardMaterial("dot", scene);
          dotMaterial.emissiveColor = Color3.FromHexString("#CC9423");
          dot.material = dotMaterial;

          dot.isVisible = false;

          hitTest.onHitTestResultObservable.add((results) => {
            if (results.length) {
              dot.isVisible = true;
              results[0].transformationMatrix.decompose(
                dot.scaling,
                dot.rotationQuaternion as any,
                dot.position
              );
              console.log("1111", dot.position);
              lastHitTest = results[0];
            
            } else {
              lastHitTest = null;
              // dot.isVisible = false;
            }
          });

          function processClick(): any {
            
          }

          xr.baseExperience.sessionManager.onXRFrameObservable.add(() => {
            pairs.forEach((pair: any) => {
              // ...
            });
          });

          anchorSystem.onAnchorAddedObservable.add((anchor) => {
            console.warn("processClick");
            anchor.attachedNode = processClick();
          });

        }
      }
    })();
  }, [rootNode, scene, xrSession]);

  const onInitialized = useCallback(async(engineViewCallbacks: EngineViewCallbacks) => {
    setEngineViewCallbacks(engineViewCallbacks);
  }, [engine]);

  const onSnapshot = useCallback(async () => {
    if (engineViewCallbacks) {
      setSnapshotData('data:image/jpeg;base64,' + await engineViewCallbacks.takeSnapshot());
    }
  }, [engineViewCallbacks]);

  return (
    <>
      <View style={props.style}>
        <Button title="Toggle EngineView" onPress={() => { setToggleView(!toggleView) }} />
        <Button title={ xrSession ? 'Stop XR' : 'Start XR'} onPress={onToggleXr} />
        { !toggleView &&
          <View style={{flex: 1}}>
            { enableSnapshots && 
              <View style ={{flex: 1}}>
                <Button title={'Take Snapshot'} onPress={onSnapshot}/>
                <Image style={{flex: 1}} source={{uri: snapshotData }} />
              </View>
            }
            <EngineView camera={camera} onInitialized={onInitialized} />
            <Slider style={{position: 'absolute', minHeight: 50, margin: 10, left: 0, right: 0, bottom: 0}} minimumValue={0.2} maximumValue={2} step={0.01} value={defaultScale} onValueChange={setScale} />
            <Text style={{fontSize: 12, color: 'yellow',  position: 'absolute', margin: 10}}>{trackingStateToString(trackingState)}</Text>
          </View>
        }
        { toggleView &&
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 24}}>EngineView has been removed.</Text>
            <Text style={{fontSize: 12}}>Render loop stopped, but engine is still alive.</Text>
          </View>
        }
      </View>
    </>
  );
};

const App = () => {
  const [toggleScreen, setToggleScreen] = useState(false);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        { !toggleScreen &&
          <EngineScreen style={{flex: 1}} />
        }
        { toggleScreen &&
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 24}}>EngineScreen has been removed.</Text>
            <Text style={{fontSize: 12}}>Engine has been disposed, and will be recreated.</Text>
          </View>
        }
        <Button title="Toggle EngineScreen" onPress={() => { setToggleScreen(!toggleScreen); }} />
      </SafeAreaView>
    </>
  );
};

export default App;
