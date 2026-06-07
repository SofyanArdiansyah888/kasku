---
name: react-spectrum
description: Adobe React Spectrum UI library patterns for this starter kit. Use when writing or reviewing components that use @adobe/react-spectrum — Provider setup, theming, Button with isPending, Dialog/DialogContainer, TextField, Picker, Form, and accessibility patterns.
---

# React Spectrum — Starter Kit Patterns

## Provider Setup

```tsx
import { Provider, defaultTheme } from '@adobe/react-spectrum'

<Provider theme={defaultTheme} colorScheme="light" locale="id-ID">
  {children}
</Provider>
```

Sidebar uses dark colorScheme for white-on-dark components:
```tsx
<Provider colorScheme="dark">{sidebarContent}</Provider>
```

## Button with `isPending`

Available in `@adobe/react-spectrum` v3.30+. Use `variant="accent"` for primary CTA.

```tsx
import { Button } from '@adobe/react-spectrum'

<Button variant="accent" isPending={mutation.isPending} onPress={handleSubmit}>
  Simpan Data
</Button>

<Button variant="negative" isPending={deleteMutation.isPending} onPress={handleDelete}>
  Hapus
</Button>
```

> In this starter kit, primary submit buttons use a custom `.submit-btn` class with a manual spinner for full design control. React Spectrum `Button` with `isPending` is used when React Spectrum Form components are in scope.

## Dialog (Controlled)

```tsx
import { DialogContainer, Dialog, Heading, Divider, Content, ButtonGroup, Button, Text } from '@adobe/react-spectrum'

<DialogContainer onDismiss={() => setOpen(false)}>
  {isOpen && (
    <Dialog>
      <Heading>Judul Dialog</Heading>
      <Divider />
      <Content>
        <Text>Konten dialog...</Text>
      </Content>
      <ButtonGroup>
        <Button variant="secondary" onPress={() => setOpen(false)}>Batal</Button>
        <Button variant="accent" isPending={isPending} onPress={handleConfirm}>
          Konfirmasi
        </Button>
      </ButtonGroup>
    </Dialog>
  )}
</DialogContainer>
```

## TextField & PasswordField

```tsx
import { TextField, Form } from '@adobe/react-spectrum'

<Form onSubmit={handleSubmit}>
  <TextField
    label="Email"
    type="email"
    value={email}
    onChange={setEmail}
    isInvalid={!!errors.email}
    errorMessage={errors.email}
    isDisabled={isPending}
  />
  <TextField
    label="Password"
    type="password"
    value={password}
    onChange={setPassword}
    isInvalid={!!errors.password}
    errorMessage={errors.password}
  />
</Form>
```

> This starter kit uses native `<input>` + custom CSS for login/register for exact design match. Use React Spectrum `TextField` for CRUD forms needing full accessibility.

## Picker (Select)

```tsx
import { Picker, Item } from '@adobe/react-spectrum'

<Picker
  label="Role"
  selectedKey={role}
  onSelectionChange={(key) => setRole(String(key))}
  isDisabled={isPending}
>
  <Item key="Superadmin">Superadmin</Item>
  <Item key="Editor">Editor</Item>
  <Item key="Viewer">Viewer</Item>
</Picker>
```

## Key Import Reference

```tsx
import {
  Provider,
  defaultTheme,
  Button,
  TextField,
  Form,
  Picker,
  Item,
  Dialog,
  DialogContainer,
  AlertDialog,
  Heading,
  Content,
  Divider,
  ButtonGroup,
  Text,
} from '@adobe/react-spectrum'
```

## CSS Theming

Override accent color in `index.css`:
```css
/* Target spectrum button variants */
[class*="spectrum-Button--accent"] {
  background-color: var(--color-primary) !important;
}
[class*="spectrum-Button--accent"]:hover {
  background-color: var(--color-accent) !important;
}
```

Use `UNSAFE_className` prop for component-specific overrides:
```tsx
<Button UNSAFE_className="my-btn" variant="accent">...</Button>
```
