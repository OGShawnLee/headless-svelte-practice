# Svelte-Headless

**Svelte-Headless** is a **_personal_ component library** based on **Tailwind's Headless-UI**. Built completely from scratch in **Svelte** and **Typescript** using actions and custom stores.

## Overview

### Custom Stores

All components have most of their logic contained in a **single custom store** that returns **actions** and uses specialized smaller **custom stores**. For example all the components that require keyboard navigation like _Listbox_, _Menu_, _Radio Group_ and _Tabs_ use the _navigable_ custom store. This way logic should be **easier** to **share** and **maintain**. -At least I think so-

_Since these stores are in TS files they do not use the Svelte compilation magic, this might reduce performance as some of them use the **get** store function which subscribes and unsubscribes. Further testing and refactor might be helpful in the future._

### Actions

Since the components use **actions**, you can extract them as a prop and apply them on normal HTML Elements so that you can have more control on them. Perhaps you want to use a transition directive or other actions.

_Most components are missing proper testing and aria support. Some of them do not support all the props of their official counterparts yet._

**Svelte transitions were kept in mind** when creating "**toggleable**" components like _Dialog_, _Disclosure_, _Listbox_ and _Menu_; you can extract the **action** that controls them and use them on normal HTML elements, **allowing you to use the Svelte transition API**

## Progress

Working on each component again refatoring, updating code and adding Aria support.

### Components

- [x] Dialog
- [x] Disclosure
- [x] Listbox
- [x] Menu
- [x] Popover
- [x] Radio Group
- [x] Switch
- [x] Tabs

#### Additional Components

- [ ] Slider ?
- [ ] Tags Input ?

### General

- [ ] Binding to the element itself (**bind:this**)
- [ ] Documentation
- [ ] Event forwarding and HTML attribute props
- [ ] Rendering different HTML elements (**as** prop)
- [ ] Storybook ?
- [ ] Typescript stuff ? (help)
- [ ] Using a testing library ?
