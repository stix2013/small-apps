import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import App from '../app/app.vue'

describe('App', () => {
  it('mounts successfully', () => {
    const wrapper = mount(App)
    expect(wrapper.vm).toBeTruthy()
  })
})
