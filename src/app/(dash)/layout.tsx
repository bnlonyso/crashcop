import NavBar from '@/widgets/navbar/NavBar'
import React, { FC, PropsWithChildren } from 'react'
import Header from '@/widgets/header/Header'
import Logo from '@/components/misc/Logo'
import { Button } from '@/components/ui/button'
import { Ghost, GithubLogo, PiggyBank } from '@phosphor-icons/react/dist/ssr'
import { env } from '@/env'

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
      <footer className="mx-auto mb-3 mt-10 flex w-[92.5%] flex-row justify-between sm:mt-auto sm:max-w-[47rem] sm:flex-row">
        <div className="flex w-fit flex-row items-center pl-2 text-muted-foreground sm:mx-0">
          <Logo width={22} height={22} className="my-0" />
          <h1 className="m-0 px-1 text-xl font-bold tracking-tight leading-none bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
            crashcop
          </h1>
        </div>
        <div className="flex flex-row justify-center text-center">
          <a href={env.NEXT_PUBLIC_REPO_LINK} target="_blank" rel="noopener">
            <Button variant="link" className="mx-1 p-1 px-2 hover:text-primary">
              <GithubLogo size={22} className="mx-1" />
              <span className="hidden sm:flex">Репозиторий</span>
            </Button>
          </a>
          <a href={env.NEXT_PUBLIC_CONTACT_LINK} target="_blank" rel="noopener">
            <Button variant="link" className="mx-1 p-1 px-2 hover:text-primary">
              <Ghost size={22} className="mx-1" />
              <span className="hidden sm:flex">Контакты</span>
            </Button>
          </a>
          <a href={env.NEXT_PUBLIC_DONATE_LINK} target="_blank" rel="noopener">
            <Button variant="link" className="mx-1 p-1 px-2 hover:text-primary">
              <PiggyBank size={22} className="mx-1 mr-2" />{' '}
              <span className="hidden sm:flex">Поддержать</span>
            </Button>
          </a>
        </div>
      </footer>
    </>
  )
}

export default Layout
