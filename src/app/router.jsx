import { useEffect } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate, useRouteError } from 'react-router-dom'
import { appEnvironment } from '../config/environment.js'
import { MarketingLayout } from '../layouts/MarketingLayout.jsx'
import { ConsoleLayout } from '../layouts/ConsoleLayout.jsx'
import { StatusLayout } from '../layouts/StatusLayout.jsx'
import { HomePage } from '../pages/marketing/HomePage.jsx'
import { BuildPage, NetworkPage, OperatePage, ProtocolPage, ResearchPage } from '../pages/marketing/TopicPages.jsx'
import { OverviewPage } from '../pages/console/OverviewPage.jsx'
import { NodesPage, NodeDetailPage } from '../pages/console/NodesPages.jsx'
import { BlueprintsPage, BlueprintDetailPage } from '../pages/console/BlueprintPages.jsx'
import { ServiceBlocksPage, ServiceBlockDetailPage } from '../pages/console/ServiceBlockPages.jsx'
import { DataAvailabilityPage } from '../pages/console/DataAvailabilityPage.jsx'
import { EvidencePage } from '../pages/console/EvidencePage.jsx'
import { SystemPage } from '../pages/console/SystemPage.jsx'
import { StatusPage } from '../pages/status/StatusPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'

const legacyHashes = {
  '#vision': '/protocol',
  '#manifesto': '/protocol',
  '#stack': '/protocol',
  '#innovations': '/research',
  '#router': '/network',
  '#roadmap': '/status',
  '#tokenomics': '/protocol',
}

function SurfaceIndex() {
  if (appEnvironment.surface === 'console') return <Navigate replace to="/overview" />
  if (appEnvironment.surface === 'status') return <Navigate replace to="/status" />
  return <HomePage />
}

function RouteEffects() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const redirect = legacyHashes[window.location.hash]
    if (redirect) navigate(redirect, { replace: true })
  }, [navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
    const leaf = location.pathname.split('/').filter(Boolean).pop() || 'protocol'
    document.title = `${leaf.replaceAll('-', ' ')} | VAMS`
  }, [location.pathname])

  return <Outlet />
}

function RouteError() {
  const error = useRouteError()
  return (
    <div className="route-error" role="alert">
      <p className="eyebrow">Application boundary</p>
      <h1>Protocol view unavailable.</h1>
      <p>{error?.message || 'The route could not be rendered.'}</p>
      <a className="button" href="/">Return home</a>
    </div>
  )
}

export const routeConfig = [
  {
    element: <RouteEffects />,
    errorElement: <RouteError />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { path: '/', element: <SurfaceIndex /> },
          { path: '/protocol', element: <ProtocolPage /> },
          { path: '/network', element: <NetworkPage /> },
          { path: '/build', element: <BuildPage /> },
          { path: '/operate', element: <OperatePage /> },
          { path: '/research', element: <ResearchPage /> },
        ],
      },
      {
        element: <ConsoleLayout />,
        children: [
          { path: '/overview', element: <OverviewPage /> },
          { path: '/nodes', element: <NodesPage /> },
          { path: '/nodes/:nodeId', element: <NodeDetailPage /> },
          { path: '/blueprints', element: <BlueprintsPage /> },
          { path: '/blueprints/:blueprintId', element: <BlueprintDetailPage /> },
          { path: '/service-blocks', element: <ServiceBlocksPage /> },
          { path: '/service-blocks/:serviceBlockId', element: <ServiceBlockDetailPage /> },
          { path: '/data-availability', element: <DataAvailabilityPage /> },
          { path: '/evidence', element: <EvidencePage /> },
          { path: '/system', element: <SystemPage /> },
        ],
      },
      {
        path: '/status',
        element: <StatusLayout />,
        children: [{ index: true, element: <StatusPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routeConfig)
