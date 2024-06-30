import { Outlet, Navigate } from 'react-router-dom';

const AuthLayout = () => {
  const isAuthenticated = false;

  const getRandomVideoSrc = () => {
    const randomNumber = Math.floor(Math.random() *11) +1;
    return `/assets/videos/Synapse_web${randomNumber}.mov`;
  };

  const videoSrc = getRandomVideoSrc();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to ="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col
          py-10">
            <Outlet />
          </section>

          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          ></video>
        </>
      )}
    </>
  );
}

export default AuthLayout