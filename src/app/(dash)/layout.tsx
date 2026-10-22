import NavBar from '@/widgets/navbar/NavBar'
import React, { FC, PropsWithChildren } from 'react'
import Header from '@/widgets/header/Header'
import Logo from '@/components/misc/Logo'

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="mx-auto flex w-[92.5%] flex-col justify-center sm:max-w-[47rem]">
        <div className="mb-8 flex w-full flex-col">
          <Header />

          {children}
        </div>

        <NavBar />
      </div>
      <footer className="mx-auto mb-3 mt-10 flex w-[92.5%] flex-row justify-between sm:mt-auto sm:max-w-[47rem] items-center">
        <div className="flex flex-col sm:flex-row sm:items-center pl-2 text-muted-foreground sm:mx-0">
          <div className="flex items-center">
            <Logo width={22} height={22} className="my-0" />
            <h1 className="m-0 px-1 text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              crashcop
            </h1>
          </div>
          <span className="text-[11px] text-muted-foreground/70 sm:ml-2">
            (копия{' '}
            <a
              href="https://github.com/arsendgaf/crashed.nis"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              crashed.nis
            </a>
            )
          </span>
        </div>
      </footer>
    </>
  )
}

export default Layout
