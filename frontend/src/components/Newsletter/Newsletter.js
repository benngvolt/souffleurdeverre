import { useRef, useState, useContext, useEffect, useMemo } from 'react'
import { Context } from '../../utils/Context'
import ConfirmBox from '../ConfirmBox/ConfirmBox'
import ErrorText from '../ErrorText/ErrorText'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { API_URL } from '../../utils/constants'
import facebookLogo from '../../assets/facebook_black.png'
import xLogo from '../../assets/x_black.png'
import youtubeLogo from '../../assets/youtube_black.png'
import instagramLogo from '../../assets/instagram_black.png'
import DOMPurify from 'dompurify'
import Alert from '../Alert/Alert'


function Newsletter({ setHandleDisplayNewsletter, handleDisplayNewsletter }) {



  /* ---------------------------
  ----- RÉCUPÉRATION CONTEXT ---
  ----------------------------*/
  const { sortedEvents, projects } = useContext(Context)

  /* ---------------------------
  ----- STATES & REFS ----------
  ----------------------------*/
  const [confirmBoxState, setConfirmBoxState] = useState(false)
  const [displayServerError, setDisplayServerError] = useState(false)
  const [displayError, setDisplayError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [okMsg, setOkMsg] = useState(null)

  useEffect(() => {
    if (okMsg) {
        const timer = setTimeout(() => setOkMsg(null), 5000) // 5 sec
        return () => clearTimeout(timer)
    }
    }, [okMsg])

  const bodyRef = useRef(null)

  function closeForm() {
    setHandleDisplayNewsletter(false)
  }
  function closeConfirmBox() { setConfirmBoxState(false) }
  function openConfirmBox() { setConfirmBoxState(true) }

  /* -----------------------------
  ----- PURIFIE LE HTML ----
  ------------------------------*/
  const normalizeHtml = (html = '') =>
    html
      .replace(/&nbsp;/g, ' ')
      .replace(/<div>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')

  const toSafeHtml = (html = '') => {
    const normalized = normalizeHtml(html)
    return DOMPurify.sanitize(normalized, {
      ALLOWED_TAGS: ['p','br','em','strong','a','ul','ol','li','span'],
      ALLOWED_ATTR: ['href','target','rel']
    })
  }

  /* -----------------------------
  ----- HELPERS FORMATAGE DATE ----
  ------------------------------*/
  const dt = (d) => new Date((d || '') + ((d || '').length === 10 ? 'T00:00:00' : ''))
  const fmtDay = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const fmtDate = (iso) => fmtDay.format(dt(iso)).replace(/\./g, '')

  const formatRange = (start, end) => {
    if (!end || start === end) return fmtDate(start)
    const s = dt(start), e = dt(end)
    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
    if (sameMonth) {
      const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' })
      const tailFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' })
      return `${dayFmt.format(s)}–${dayFmt.format(e)} ${tailFmt.format(e).replace(/\./g, '')}`
    }
    const sFmt = fmtDate(start)
    const eFmt = fmtDate(end)
    if (s.getFullYear() === e.getFullYear()) {
      return `${sFmt.replace(String(s.getFullYear()), '').trim()} – ${eFmt}`
    }
    return `${sFmt} – ${eFmt}`
  }

  /* -------------------------------------------
  ----- RÉCUP IMG + SUMMARY DEPUIS projects -----
  --------------------------------------------*/
  const projectMetaMap = useMemo(() => {
    const map = new Map()
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        const key = p?._id || p?.title || ('unknown_' + Math.random().toString(36).slice(2))
        let hero
        if (typeof p.mainImageIndex === "number" && Array.isArray(p.images) && p.images[p.mainImageIndex]) {
          hero = p.images[p.mainImageIndex].imageUrl
        }
        const summary = p?.summary || p?.excerpt || p?.description || p?.shortDescription || undefined
  
        map.set(key, {
          id: p?._id || null,
          slug: p?.slug || p?.urlSlug || null,
          title: p?.title || 'Projet',
          subtitle: p?.subtitle || null,
          projectType: p?.projectType || null,
          duration: p?.duration || null,
          heroImageUrl: hero || null,
          summary
        })
      })
    }
    return map
  }, [projects])
    
  /* ---------------------------------------
  ----- GROUPAGE PAR PROJET (newsletter) ----
  ----------------------------------------*/
  const newsletterProjects = useMemo(() => {
    if (!Array.isArray(sortedEvents)) return []
  
    const byProject = new Map()
  
    sortedEvents.forEach(ev => {
      const p = ev?.project || {}
      const projectKey = p?._id || p?.title || ('unknown_' + Math.random().toString(36).slice(2))
      const existing = byProject.get(projectKey)
  
      const pm =
        projectMetaMap.get(p?._id) ||
        projectMetaMap.get(p?.title) ||
        {}
  
      const id        = p?._id       ?? pm.id
      const slug      = p?.slug      ?? pm.slug
      const title     = p?.title     ?? pm.title ?? 'Projet'
      const subtitle  = p?.subtitle  ?? pm.subtitle
      const projectType = p?.projectType ?? pm.projectType
      const duration  = p?.duration  ?? pm.duration
      const heroImageUrl = pm.heroImageUrl
      const summary   = p?.summary || p?.description || pm.summary
  
      const base = existing || {
        key: projectKey,
        id,
        slug,
        title,
        subtitle,
        projectType,
        duration,
        heroImageUrl,
        summary,
        shows: [],
        residencies: [],
      }
  
      if (!base.id && id) base.id = id
      if (!base.slug && slug) base.slug = slug
      if (!base.title && title) base.title = title
      if (!base.subtitle && subtitle) base.subtitle = subtitle
      if (!base.projectType && projectType) base.projectType = projectType
      if (!base.duration && duration) base.duration = duration
      if (!base.heroImageUrl && heroImageUrl) base.heroImageUrl = heroImageUrl
      if (!base.summary && summary) base.summary = summary
  
      if (ev?.type === 'show') {
        base.shows.push({
          date: ev.startDate,
          endDate: ev.endDate && ev.endDate !== ev.startDate ? ev.endDate : undefined,
          city: ev?.show?.city,
          placeName: ev?.show?.placeName,
          placeLink: ev?.show?.placeLink,
          times: Array.isArray(ev?.times) ? ev.times : undefined,
        })
      } else if (ev?.type === 'residency') {
        base.residencies.push({
          startDate: ev?.residency?.startDates || ev.startDate,
          endDate: ev?.residency?.endDates || ev.endDate,
          residencyType: ev?.residency?.residencyType,
          city: ev?.residency?.city,
          placeName: ev?.residency?.placeName,
          placeLink: ev?.residency?.placeLink,
        })
      }
  
      byProject.set(projectKey, base)
    })
  
    const projectsArr = Array.from(byProject.values())
  
    projectsArr.forEach(gp => {
      gp.shows.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      gp.residencies.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
    })
  
    projectsArr.sort((a, b) => {
      const nextA = Math.min(
        ...[].concat(
          gpTimes(a.shows),
          gpTimes(a.residencies, true)
        )
      )
      const nextB = Math.min(
        ...[].concat(
          gpTimes(b.shows),
          gpTimes(b.residencies, true)
        )
      )
      return (isFinite(nextA) ? nextA : Infinity) - (isFinite(nextB) ? nextB : Infinity)
    })
  
    return projectsArr
  }, [sortedEvents, projectMetaMap])

  function gpTimes(arr = [], isResidency = false){
    return arr.map(x => new Date(isResidency ? x.startDate : x.date).getTime())
  }

  /*------------------------------------------------------
  ----- envelopper dans un squelette HTML email simple ----
  ------------------------------------------------------*/
  function wrapEmailHtml(inner) {
    return `<!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="x-apple-disable-message-reformatting">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Newsletter</title>
                <style>
                  html, body { margin:0 !important; padding:0 !important; }
                  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
                  table { border-collapse:collapse !important; }
                  .w-100 { width:100% !important; }
                  .p-20 { padding:20px !important; }
                  .center { margin:0 auto !important; }
                  .h-auto { height:auto !important; }
                  .fs-35 { font-size:35px !important; }
                  .fs-20 { font-size:20px !important; }
                  .fs-18 { font-size:18px !important; }
                  .fs-16 { font-size:16px !important; }
                  .datasrow { column-gap: 1rem !important;}
                  .stack { display:block !important; width:100% !important; }
                  @media only screen and (max-width: 600px) {
                    .wrap { width:100% !important; }
                    .p-20 { padding:12px !important; }
                    .fs-35 { font-size:14px !important; line-height:1.2 !important; }
                    .fs-20 { font-size:14px !important; }
                    .fs-18 { font-size:14px !important; }
                    .fs-16 { font-size:14px !important; }
                    .datasrow { flex-direction: column !important;}
                    .intro { width:92% !important; margin:24px auto !important; }
                    .hero-img { height:275px !important; max-height:none !important; }
                    .badge { font-size:12px !important; }
                    .footer-brand { padding:10px 12px; box-sizing: border-box, font-size: 14px !important;
                     }
                  }
                  @media only screen and (min-width:601px) {
                    .wrap { width:640px !important; }
                  }
                </style>
            </head>
            <body style="margin:0; padding:0; background:#ffffff;">
                <center style="width:100%; table-layout:fixed;">
                <!--[if mso]>
                <table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0"><tr><td>
                <![endif]-->
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="wrap center" style="margin:0 auto; padding:0; max-width:640px;">
                    <tr>
                    <td class="p-20" style="padding:20px;">
                        ${inner}
                    </td>
                    </tr>
                </table>
                <!--[if mso]></td></tr></table><![endif]-->
                </center>
            </body>
        </html>`
  }

  /*-----------------------------------------
  ----- SUBMIT → POST vers ton BFF ----------
  -----------------------------------------*/

  const token = window.sessionStorage.getItem('1')

  async function handleSubmit(e) {
    e.preventDefault()
    setDisplayError(false)
    setDisplayServerError(false)
    setOkMsg(null)

    try {
      setLoading(true)
      const container = bodyRef.current
      if (!container) throw new Error("Newsletter HTML introuvable.")
      let inner = container.innerHTML
      const htmlContent = wrapEmailHtml(inner)
      const payload = {
        templateName: `Newsletter ${new Date().toISOString().slice(0,10)}`,
        subject: "Nos dates & actualités",
        htmlContent
      }
      const r = await fetch(`${API_URL}/api/newsletters/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      })
      if (!r.ok) {
        const raw = await r.text()
        let errJson = {}
        try { errJson = JSON.parse(raw) } catch {}
        console.error('Erreur création template Brevo:', {
          status: r.status,
          statusText: r.statusText,
          headers: Object.fromEntries(r.headers.entries()),
          raw
        })
        throw new Error(errJson?.error || `Échec création template (HTTP ${r.status})`)
      }
      const data = await r.json()
      setOkMsg(`Template créé !! Tu peux le retrouver sur Brevo. (id: ${data?.id ?? "?"})`)
      setTimeout(() => closeForm(), 3000)
    } catch (err) {
      console.error(err)
      setDisplayServerError(true)
    } finally {
      setLoading(false)
    }
  }
  
  /* -----------------------
  ----- RENDER JSX ---------
  ------------------------*/
  return (
    <form method="post" onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',height:'100%',rowGap:'9px',width:'80%',overflow:'scroll',margin:'auto',backgroundColor:'#fff'}}>
      {/* bouton fermer */}
      <button type='button' onClick={openConfirmBox} style={{width:'auto',display:'flex',flexDirection:'row',justifyContent:'flex-end',color:'#333',background:'none',border:'none',position:'sticky',top:80,left:60,zIndex:100}}>
        <FontAwesomeIcon icon={faXmark} style={{height:'2em',marginRight:15,cursor:'pointer'}}/>
      </button>

      {/* CONTENEUR DU HTML EMAIL */}
      <div style={{width:'50%',margin:'80px auto'}}>
        <div ref={bodyRef}>
          {/* HEADER */}
          <div style={{width:'100%',margin:'0 auto',background:'#00f0ff',padding:'30px 0',textAlign:'center'}}>
            <img src="https://storage.googleapis.com/website_ciesouffleur/assets/logoSouffleur.jpg" alt="Cie Souffleur de Verre" style={{width:'30%',maxWidth:220,height:'auto',display:'block',margin:'0 auto'}}/>
            <p className="fs-35" style={{margin:'20px auto 6px auto',fontSize:35,color:'#000',fontWeight:'700',lineHeight:1,letterSpacing:'.5px'}}>NEWSLETTER</p>
            <p className="fs-20" style={{margin:'0 auto',fontSize:20,color:'#000',fontWeight:700,lineHeight:1.2}}>Actualité de la compagnie</p>
            <p style={{margin:'2px auto 0 auto',fontSize:18,color:'#000',fontWeight:600,lineHeight:1.2}}>Le Souffleur de Verre</p>
            {/* Réseaux */}
            <table
              role="presentation"
              align="center"
              style={{
                margin: '30px auto 0 auto',
                borderCollapse: 'collapse',
                'mso-table-lspace': '0pt',
                'mso-table-rspace': '0pt',
              }}
            >
              <tbody>
                <tr>
                  <td style={{ padding: '0 8px' }}>
                    <a
                      aria-label="Accéder à la page Facebook de la compagnie"
                      href="https://www.facebook.com/souffleurdeverre"
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <img
                        src="https://storage.googleapis.com/website_ciesouffleur/assets/facebook_black.jpg"
                        alt="facebook"
                        width={40}
                        height={40}
                        style={{
                          display: 'block',
                          border: 0,
                          outline: 'none',
                          textDecoration: 'none',
                          msInterpolationMode: 'bicubic',
                        }}
                      />
                    </a>
                  </td>
                  <td style={{ padding: '0 8px' }}>
                    <a
                      aria-label="Accéder à la page X (Twitter) de la compagnie"
                      href="https://twitter.com/ciesouffleur"
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <img
                        src="https://storage.googleapis.com/website_ciesouffleur/assets/x_black.jpg"
                        alt="x"
                        width={40}
                        height={40}
                        style={{
                          display: 'block',
                          border: 0,
                          outline: 'none',
                          textDecoration: 'none',
                          msInterpolationMode: 'bicubic',
                        }}
                      />
                    </a>
                  </td>
                  <td style={{ padding: '0 8px' }}>
                    <a
                      aria-label="Accéder à la page Youtube de la compagnie"
                      href="https://www.youtube.com/@compagnielesouffleurdeverr6312"
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <img
                        src="https://storage.googleapis.com/website_ciesouffleur/assets/youtube_black.jpg"
                        alt="youtube"
                        width={40}
                        height={40}
                        style={{
                          display: 'block',
                          border: 0,
                          outline: 'none',
                          textDecoration: 'none',
                          msInterpolationMode: 'bicubic',
                        }}
                      />
                    </a>
                  </td>
                  <td style={{ padding: '0 8px' }}>
                    <a
                      aria-label="Accéder à la page Instagram de la compagnie"
                      href="https://www.instagram.com/ciesouffleur"
                      target="_blank"
                      rel="noreferrer"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <img
                        src="https://storage.googleapis.com/website_ciesouffleur/assets/instagram_black.jpg"
                        alt="instagram"
                        width={40}
                        height={40}
                        style={{
                          display: 'block',
                          border: 0,
                          outline: 'none',
                          textDecoration: 'none',
                          msInterpolationMode: 'bicubic',
                        }}
                      />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* INTRO */}
          <p className="intro fs-18" style={{color:'#000',fontSize:18,textAlign:'center',margin:'40px auto',width:'80%',maxWidth:520,lineHeight:1.5}}>
            Retrouvez ici l’essentiel de nos actualités, les spectacles en tournée et les créations en cours.
          </p>

          {/* PROJETS */}
          {newsletterProjects.map((project) => (
            <table key={project.id || project.key} role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{borderCollapse:'collapse',margin:'40px auto 0 auto',width:'100%'}}>
              <tbody>
                <tr>
                  <td style={{padding:0}}>
                    {project.heroImageUrl && (
                      <img src={project.heroImageUrl} alt={project.title || 'Illustration'} className="hero-img" style={{width:'100%', height:'400px', objectFit:'cover', display:'block'}}/>
                    )}

                    {/* Titre + méta */}
                    <div className="datasrow" style={{ display:'flex', columnGap:'1rem', margin:'12px 0 20px' }}>
                      <h2 className="fs-20" style={{margin:0,fontWeight:800,color:'#ff00ff',fontSize:20,lineHeight:1.2}}>{project.title}</h2>
                      {project.subtitle ? (
                        <p className="fs-16" style={{margin:0,fontSize:18,color:'#ff00ff',fontStyle:'italic'}}><em>{project.subtitle}</em></p>
                      ) : null}
                      {project.residencies && project.residencies.length > 0 && (
                        <span className="fs-16" style={{display:'inline-block',marginRight:8,fontSize:14,fontWeight:700,background:'#ff00ff',color:'#fff',padding:'2px 6px',borderRadius:2,textTransform:'uppercase'}}>en création</span>
                      )}
                      {project.shows && project.shows.length > 0 && (
                        <span className="fs-16" style={{display:'inline-block',fontSize:14,fontWeight:700,background:'#ff00ff',color:'#fff',padding:'2px 6px',borderRadius:2,textTransform:'uppercase'}}>en tournée</span>
                      )}
                      {project.projectType ? (
                        <p className="fs-16" style={{margin:0,fontSize:16,color:'#ff00ff',fontStyle:'italic'}}>{project.projectType}</p>
                      ) : null}
                    </div>

                    {/* Résumé */}
                    {project.summary ? (
                      <div  className="fs-16" style={{width:'100%',fontSize:16,lineHeight:1.6,textAlign:'justify'}} dangerouslySetInnerHTML={{ __html: toSafeHtml(project.summary) }} />
                    ) : null}

                    {/* DATES – représentations */}
                    {project.shows && project.shows.length > 0 && (
                      <ul className="fs-16" style={{margin:'16px 0',paddingLeft:0,listStyle:'none',lineHeight:1.6}}>
                        {project.shows.map((s, idx) => {
                          const when = formatRange(s.date, s.endDate)
                          const whereStr = [s.placeName, s.city].filter(Boolean).join(' — ')
                          const times = Array.isArray(s.times) && s.times.length
                            ? ' · ' + s.times.map((t) => t?.label || t?.time).filter(Boolean).join(', ')
                            : ''
                          const whereNode = s.placeLink ? (
                            <a href={s.placeLink} target="_blank" rel="noopener noreferrer" style={{color:'#000',textDecoration:'underline'}}>{whereStr}</a>
                          ) : (
                            whereStr
                          )
                          return (
                            <li key={idx} style={{margin:'6px 0'}}>
                              <strong>{when}</strong> — {whereNode}{times}
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {/* DATES – résidences */}
                    {project.residencies && project.residencies.length > 0 && (
                      <ul className="fs-16" style={{margin:'16px 0',paddingLeft:0,listStyle:'none'}}>
                        {project.residencies.map((r, idx) => {
                          const when = formatRange(r.startDate, r.endDate)
                          const whereStr = [r.placeName, r.city].filter(Boolean).join(' - ')
                          const type = r.residencyType ? ` (${r.residencyType})` : ''
                          const whereNode = r.placeLink ? (
                            <a href={r.placeLink} target="_blank" rel="noopener noreferrer" style={{color:'#000',textDecoration:'underline'}}>{whereStr}</a>
                          ) : (
                            whereStr
                          )
                          return (
                            <li key={idx} style={{margin:'6px 0'}}>
                              <strong>{when}</strong>{type} — {whereNode}
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {/* Lien projet */}
                    <a className="fs-16" href={`https://souffleurdeverre.fr/#/spectacles/${project.id}`} style={{display:'inline-block',marginTop:6,color:'#ff00ff',fontWeight:700,fontStyle:'italic',textDecoration:'underline'}}>en savoir +</a>
                  </td>
                </tr>
              </tbody>
            </table>
          ))}

          {/* FOOTER */}
          <div style={{width:'100%',margin:'40px auto 0 auto',textAlign:'center',fontSize:16,lineHeight:1.5}}>
            <div className="footer-brand" style={{background:'#ff8a00',color:'#000',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',padding:'8px 12px', boxSizing:'border-box', width:'100%',margin:'0 auto 24px auto'}}>COMPAGNIE LE SOUFFLEUR DE VERRE</div>

            <div style={{width:'100%',margin:'0 auto 22px auto'}}>
              <h4 style={{margin:'0 0 10px 0',color:'#ff8a00',fontWeight:700,textTransform:'uppercase'}}>RESPONSABLE ARTISTIQUE</h4>
              <p style={{margin:'4px 0'}}>Julien Rocha</p>
              <p style={{margin:'4px 0'}}>06 61 19 39 35</p>
              <p style={{margin:'4px 0'}}><a href="mailto:julienrocha.souffleurdeverre@gmail.com" style={{color:'#000',textDecoration:'underline'}}>julienrocha.souffleurdeverre@gmail.com</a></p>
            </div>

            <div style={{width:'100%',margin:'0 auto 22px auto'}}>
              <h4 style={{margin:'0 0 10px 0',color:'#ff8a00',fontWeight:700,textTransform:'uppercase'}}>ADMINISTRATION DE PRODUCTION, RÉSERVATIONS PRO</h4>
              <p style={{margin:'4px 0'}}>Cédric Veschambre</p>
              <p style={{margin:'4px 0'}}>07 86 55 81 26</p>
              <p style={{margin:'4px 0'}}><a href="mailto:ciesouffleur@gmail.com" style={{color:'#000',textDecoration:'underline'}}>ciesouffleur@gmail.com</a></p>
              <p style={{margin:'4px 0'}}><a href="mailto:ciesouffleur@hotmail.fr" style={{color:'#000',textDecoration:'underline'}}>ciesouffleur@hotmail.fr</a></p>
            </div>

            {/* <div style={{width:'100%',margin:'0 auto 22px auto'}}>
              <h4 style={{margin:'0 0 10px 0',color:'#ff8a00',fontWeight:700,textTransform:'uppercase'}}>FICHE TECHNIQUE ET ADMINISTRATION</h4>
              <p style={{margin:'4px 0'}}><a href="mailto:ciesouffleur@hotmail.com" style={{color:'#000',textDecoration:'underline'}}>ciesouffleur@hotmail.com</a></p>
            </div> */}

            <div style={{width:'100%',margin:'8px auto 26px auto'}}>
              <p style={{margin:'4px 0'}}>Compagnie Le <strong>Souffleur</strong> de Verre</p>
              <p style={{margin:'4px 0'}}>36 rue de Blanzat</p>
              <p style={{margin:'4px 0'}}>63100 Clermont-Ferrand</p>
              {/* <p style={{margin:'4px 0'}}><a href="mailto:ciesouffleur@hotmail.fr" style={{color:'#000',textDecoration:'underline'}}>ciesouffleur@hotmail.fr</a></p> */}
              <p style={{margin:'4px 0'}}><a href="https://souffleurdeverre.fr/" style={{color:'#000',textDecoration:'underline'}}>souffleurdeverre.fr</a></p>
            </div>

            <div style={{width:'100%',margin:'0 auto 24px auto',background:'#ff8a00',color:'#fff',padding:'14px 16px',boxSizing:'border-box',textAlign:'center'}}>
              <p style={{margin:0,lineHeight:1.4}}>La Compagnie Le Souffleur de verre est conventionnée avec le Ministère de la Culture - DRAC Auvergne-Rhône-Alpes, La Région Auvergne-Rhône-Alpes et la Ville de Clermont-Ferrand.</p>
            </div>
          </div>
        </div>
      </div>

      {okMsg && 
      <Alert message={okMsg} onClose={() => setOkMsg(null)} />
      }
      

      <ErrorText errorText={"Une erreur s'est produite"} state={displayServerError}/>
      <ErrorText errorText={"Tous les champs marqués d'une * doivent être remplis"} state={displayError}/>

      <div style={{display:'flex',flexDirection:'row',margin:'0 auto 54px auto',width:'100%',justifyContent:'center',columnGap:16}}>
        <button type='submit' disabled={loading} style={{fontSize:22,fontFamily:'MainFont_light, Arial, sans-serif',fontWeight:'bold',color:'#333',borderRadius:0,border:'1px solid #333',background:'none',width:170,padding:15,cursor: loading ? 'default' : 'pointer'}}>{loading ? 'ENVOI…' : 'VALIDER'}</button>
        <button type='button' onClick={openConfirmBox} style={{fontSize:22,fontFamily:'MainFont_light, Arial, sans-serif',fontWeight:'bold',color:'#333',borderRadius:0,border:'1px solid #333',background:'none',width:170,padding:15,cursor:'pointer'}}>ANNULER</button>
      </div>

      <ConfirmBox
        affirmativeChoice={closeForm}
        confirmBoxState={confirmBoxState}
        negativeChoice={closeConfirmBox}
      />
    </form>
  )
}

export default Newsletter