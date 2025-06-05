import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import AboutPage from '../../pages/about.vue'

describe('AboutPage', () => {
  it('mounts successfully and renders static text', () => {
    const wrapper = mount(AboutPage)
    expect(wrapper.vm).toBeTruthy()
    expect(wrapper.html()).toContain('<h1>About Us</h1>')
  })
})
