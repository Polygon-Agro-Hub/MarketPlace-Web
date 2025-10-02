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
      <main className="pt-20 md:pt-[126px]">{children}</main>
      <Footer />
    </>
  )
}