import React, { useState, useEffect } from 'react'
import Header from './header'
import HeaderSkeleton from '@/components/skeletons/HeaderSkeleton'
import Footer from './footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isHeaderLoaded, setIsHeaderLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHeaderLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {isHeaderLoaded ? <Header /> : <HeaderSkeleton />}
      {/* Add padding-top so content doesn’t hide behind fixed header */}
      <main className="pt-[129px]">{children}</main>
      <Footer />
    </>
  )
}