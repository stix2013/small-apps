import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import HomePage from '../../app/pages/index.vue'

describe('IndexPage', () => {
  it('mounts successfully and renders static text', () => {
    const wrapper = mount(HomePage)
    expect(wrapper.vm).toBeTruthy()
    expect(wrapper.html()).toContain('<h1>Welcome to Yellow Mobile</h1>')
    expect(wrapper.html()).toContain('<p>This is the Home page.</p>')
  })
})
