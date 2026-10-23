'use client'

import React from 'react'
import { useMedia } from 'react-use'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { FC } from 'react'

type ResponsiveModalProps = {
  children: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  trigger: React.ReactNode
  close?: React.ReactNode
}

const ResponsiveModal: FC<ResponsiveModalProps> = ({
  children,
  close,
  trigger,
  description,
  title,
}) => {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMedia('(min-width: 768px)', false)

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[560px] md:max-w-[620px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-words text-left">{title}</DialogTitle>
            <DialogDescription className="break-words text-left">{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left px-4">
          <DrawerTitle className="break-words text-left">{title}</DrawerTitle>
          <DrawerDescription className="break-words text-left">{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto max-h-[65vh] pb-2">{children}</div>
        <DrawerFooter className="pt-2 px-4">
          <DrawerClose asChild>{close}</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ResponsiveModal
