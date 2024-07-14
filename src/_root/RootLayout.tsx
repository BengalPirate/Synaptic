import BottomBar from '@/components/shared/BottomBar'
import LeftSidebar from '@/components/shared/LeftSidebar'
import Topbar from '@/components/shared/Topbar'

import { Outlet } from 'react-router-dom'
import { useGetCurrentUser } from '@/lib/react-query/queriesAndMutations';
import LifestreamEffect from '../../styles/LifestreamEffect';

const RootLayout = () => {
  const { data: currentUser } = useGetCurrentUser();

  return (
    <div className="w-full md:flex relative">
      {currentUser && <LifestreamEffect />} {/* Add the lifestream effect background for authenticated users */}
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <BottomBar />
    </div>
  )
}

export default RootLayout