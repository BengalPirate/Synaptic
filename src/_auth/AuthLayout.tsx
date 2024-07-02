import { Outlet, Navigate } from 'react-router-dom';
import Fabric from './Fabric'; // Adjust the import path based on your project structure

const AuthLayout = () => {
  const isAuthenticated = false;

  const getRandomVideoSrc = () => {
    const randomNumber = Math.floor(Math.random() * 3) + 1;
    return `/assets/videos/Synapse_web${randomNumber}.mov`;
  };

  const videoSrc = getRandomVideoSrc();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="relative w-full h-screen grid grid-cols-2">
          <section className="flex justify-center items-center flex-col py-10 bg-black">
            <Outlet />
          </section>

          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="hidden xl:block h-screen w-full object-cover bg-no-repeat"
          ></video>

          <div className="hidden xl:block h-screen absolute inset-y-0 left-1 transform -translate-x- w-13 z-10 pointer-events-none">
            <Fabric />
          </div>
        </div>
        
      )}
    </>
  );
};

export default AuthLayout;
