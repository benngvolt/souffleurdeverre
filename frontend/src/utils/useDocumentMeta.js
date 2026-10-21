import { useEffect } from 'react'

/**
 * Met à jour <title> et les balises <meta>/<link> du <head> pendant que le
 * composant est monté, puis restaure les valeurs précédentes au démontage
 * (pour ne pas laisser fuiter les infos d'une page vers la suivante).
 *
 * Remplace react-helmet-async : ce site n'a aucun rendu serveur, donc la
 * réconciliation SSR de cette librairie n'apporte rien, et son dispatcher
 * (qui mute le DOM pendant le rendu React) ne committait plus les balises.
 */
export function useDocumentMeta({
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogUrl,
    ogImage,
    robots,
} = {}) {
    useEffect(() => {
        const originalTitle = document.title
        if (title) document.title = title

        const restoreFns = []

        function applyMeta(attr, key, content) {
            if (content === undefined || content === null || content === '') return
            let element = document.querySelector(`meta[${attr}="${key}"]`)
            const existed = !!element
            const previousContent = element?.getAttribute('content') ?? null
            if (!element) {
                element = document.createElement('meta')
                element.setAttribute(attr, key)
                document.head.appendChild(element)
            }
            element.setAttribute('content', content)
            restoreFns.push(() => {
                if (!existed) {
                    element.remove()
                } else {
                    element.setAttribute('content', previousContent)
                }
            })
        }

        function applyLink(rel, href) {
            if (!href) return
            let element = document.querySelector(`link[rel="${rel}"]`)
            const existed = !!element
            const previousHref = element?.getAttribute('href') ?? null
            if (!element) {
                element = document.createElement('link')
                element.setAttribute('rel', rel)
                document.head.appendChild(element)
            }
            element.setAttribute('href', href)
            restoreFns.push(() => {
                if (!existed) {
                    element.remove()
                } else {
                    element.setAttribute('href', previousHref)
                }
            })
        }

        applyMeta('name', 'description', description)
        applyLink('canonical', canonical)
        applyMeta('property', 'og:title', ogTitle)
        applyMeta('property', 'og:description', ogDescription)
        applyMeta('property', 'og:url', ogUrl)
        applyMeta('property', 'og:image', ogImage)
        applyMeta('name', 'robots', robots)

        return () => {
            document.title = originalTitle
            restoreFns.forEach((fn) => fn())
        }
    }, [title, description, canonical, ogTitle, ogDescription, ogUrl, ogImage, robots])
}
