import { describe, it, expect } from 'vitest'
import { getIcon, iconMap, type IconName } from './iconMapper'
import {
  Activity,
  Briefcase,
  Calendar,
  CalendarDays,
  Circle,
  Folder,
  Globe,
  House,
  Inbox,
  Megaphone,
  Smartphone,
  Tag,
  TriangleAlert,
} from 'lucide-react'

describe('iconMapper', () => {
  describe('iconMap', () => {
    it('should contain all expected icon mappings', () => {
      expect(iconMap).toBeDefined()
      expect(Object.keys(iconMap)).toHaveLength(13)
    })

    it('should map Activity to correct component', () => {
      expect(iconMap.Activity).toBe(Activity)
    })

    it('should map Briefcase to correct component', () => {
      expect(iconMap.Briefcase).toBe(Briefcase)
    })

    it('should map Calendar to correct component', () => {
      expect(iconMap.Calendar).toBe(Calendar)
    })

    it('should map CalendarDays to correct component', () => {
      expect(iconMap.CalendarDays).toBe(CalendarDays)
    })

    it('should map Circle to correct component', () => {
      expect(iconMap.Circle).toBe(Circle)
    })

    it('should map Folder to correct component', () => {
      expect(iconMap.Folder).toBe(Folder)
    })

    it('should map Globe to correct component', () => {
      expect(iconMap.Globe).toBe(Globe)
    })

    it('should map House to correct component', () => {
      expect(iconMap.House).toBe(House)
    })

    it('should map Inbox to correct component', () => {
      expect(iconMap.Inbox).toBe(Inbox)
    })

    it('should map Megaphone to correct component', () => {
      expect(iconMap.Megaphone).toBe(Megaphone)
    })

    it('should map Smartphone to correct component', () => {
      expect(iconMap.Smartphone).toBe(Smartphone)
    })

    it('should map Tag to correct component', () => {
      expect(iconMap.Tag).toBe(Tag)
    })

    it('should map TriangleAlert to correct component', () => {
      expect(iconMap.TriangleAlert).toBe(TriangleAlert)
    })
  })

  describe('getIcon', () => {
    it('should return correct icon for valid icon name', () => {
      const icon = getIcon('Activity')
      expect(icon).toBe(Activity)
    })

    it('should return correct icon for each valid IconName', () => {
      const validIconNames: IconName[] = [
        'Activity',
        'Briefcase',
        'Calendar',
        'CalendarDays',
        'Circle',
        'Folder',
        'Globe',
        'House',
        'Inbox',
        'Megaphone',
        'Smartphone',
        'Tag',
        'TriangleAlert',
      ]

      validIconNames.forEach(iconName => {
        const icon = getIcon(iconName)
        expect(icon).toBeDefined()
        expect(icon).toBe(iconMap[iconName])
      })
    })

    it('should return Circle as fallback for invalid icon name', () => {
      const icon = getIcon('InvalidIconName')
      expect(icon).toBe(Circle)
    })

    it('should return Circle as fallback for empty string', () => {
      const icon = getIcon('')
      expect(icon).toBe(Circle)
    })

    it('should handle lowercase icon names by falling back to Circle', () => {
      const icon = getIcon('activity')
      expect(icon).toBe(Circle)
    })

    it('should handle special characters by falling back to Circle', () => {
      const icon = getIcon('Activity!')
      expect(icon).toBe(Circle)
    })

    it('should handle numbers by falling back to Circle', () => {
      const icon = getIcon('123')
      expect(icon).toBe(Circle)
    })
  })

  describe('Type Safety', () => {
    it('should enforce IconName type at compile time', () => {
      // This test verifies that TypeScript type system is working
      // If this compiles, the type system is enforcing IconName correctly
      const validIcon: IconName = 'Circle'
      expect(validIcon).toBe('Circle')
    })

    it('should have all iconMap keys match IconName type', () => {
      const mapKeys = Object.keys(iconMap)
      const expectedKeys: IconName[] = [
        'Activity',
        'Briefcase',
        'Calendar',
        'CalendarDays',
        'Circle',
        'Folder',
        'Globe',
        'House',
        'Inbox',
        'Megaphone',
        'Smartphone',
        'Tag',
        'TriangleAlert',
      ]

      expect(mapKeys.sort()).toEqual(expectedKeys.sort())
    })
  })

  describe('Icon Components', () => {
    it('should return valid React components from getIcon', () => {
      const icon = getIcon('Activity')
      expect(icon).toBeDefined()
      expect(typeof icon).toBe('object')
    })

    it('should return valid React components from iconMap', () => {
      Object.values(iconMap).forEach((IconComponent) => {
        expect(IconComponent).toBeDefined()
        expect(typeof IconComponent).toBe('object')
      })
    })
  })
})
