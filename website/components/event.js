import Link from "next/link";
import { useState, useEffect } from 'react'
import { Modal, Button } from 'flowbite-react'
import dayjs from 'dayjs'
import classNames from 'classnames'

import Markdown from './markdown'

export function Card({ children, color, onClick }) {
  return (
    <div className={classNames(
        'eventcard', 
        'p-0.5 shadow-md h-full whitespace-normal'
      )} onClick={onClick}>
      <div className={classNames(
          'rounded-lg block p-3 lg:p-6 h-full'
        )} style={{background: "rgb(2,34,50)", background: "linear-gradient(0deg, rgba(2,34,50,1) 0%, rgba(7,58,83,1) 100%)"}}>
        <div className="text-body1 text-white">
          { children }
        </div>
      </div>
    </div>
  )
}

// hover:ml-1 hover:-mr-1 hover:mt-1 hover:-mb-1
export function EventCard({ event }) {
  const isWorkInProgress = event.tags?.some((el) => el.toLowerCase() === "wip")

  return (
    <EventModal event={event}>
      <div className={classNames('w-full', 'h-full', 'overflow-hidden', {'opacity-70': isWorkInProgress})}>
        {event.timeslots
          ? <TrackCard event={event} />
          : <BlockCard event={event} />
        }
      </div>
    </EventModal>
  )
}

function BlockCard({ event }) {
  return (
    <Card color={event.color}>
      <h5 className="text-h5 mb-4">
        {event.name}
      </h5>
      <div className="text-body1 mb-4">
        {event.times}
      </div>
      <div className="text-body1 mb-4">
        👤 {event.attendees} - {event.difficulty}
      </div>
      {event.dri &&
        <div className="text-body1 mb-4">
          {event.dri}
        </div>
      }
      <div className="text-body1 mb-4">
        {event.org}
      </div>
      <div className="event-tags">
        {event.tags.map((tag, i) => (
          (tag && <Tag key={i}>{tag}</Tag>)
        ))}
      </div>
    </Card>
  )
}

function TrackCard({ event }) {
  return (
    <Card color={event.color}>
      <h5 className="text-h5 mb-4">
        {event.name}
      </h5>
      <div className="text-body1 mb-4">
        {event.times}
      </div>
      <div className="text-body1 mb-4">
        👤 {event.attendees} - {event.difficulty}
      </div>
      {event.dri &&
        <div className="text-body1 mb-4">
          {event.dri}
        </div>
      }
      <div className=" text-white text-sm mt-3 text-ellipsis overflow-hidden">
        {event.org}
      </div>

      <div className="event-tags">
        {event.tags.map((tag, i) => (
          <Tag key={i}>{tag}</Tag>
        ))}
      </div>
    </Card>
  )
}

export function BlankCard() {
  return (
    <Card onClick={() => window && window.showAddEventModal()}>
      <div className="place-content-center w-full m-0 py-5 text-center text-gray-300 hover:text-gray-500">
        <div className="text-6xl">
          +
        </div>
        <div className="text-xl font-bold">
          Add your event
        </div>
      </div>
    </Card>
  )
}

/**
 * @see https://github.com/ipfs-shipyard/ipfs-thing-2022/issues/125
 */
function getLocationHash () {
  if (typeof window !== 'undefined') {
    return window.location.hash
  }
}

/**
 * @see https://github.com/ipfs-shipyard/ipfs-thing-2022/issues/125
 */
function setLocationHash (hash) {
  if (typeof window !== 'undefined') {
    if(history?.pushState) {
      history.pushState(null, null, hash);
    } else {
      window.location.hash = hash
    }
  }
}

export function EventModal({ children, event }) {
  let defaultOpenState = false
  if (getLocationHash() === event.hash) {
    defaultOpenState = true
  }
  const [openModal, setOpenModal] = useState(defaultOpenState);
  const open = () => {
    if (getLocationHash() !== event.hash) {
      setLocationHash(event.hash)
    }
    setOpenModal(true)
  }
  const close = () => {
    if (getLocationHash() === event.hash) {
      setLocationHash('#')
    }
    setOpenModal(false)
  }
  const isOpen = () => openModal === true

  const [hashChangeEventRegistered, setHashChangeEventRegistered] = useState(false);
  if (typeof window !== 'undefined' && !hashChangeEventRegistered) {
    window.addEventListener('hashchange', (hashChangeEvent) => {
      const oldUrlHash = (new URL(hashChangeEvent.oldURL)).hash
      const newUrlHash = (new URL(hashChangeEvent.newURL)).hash
      if (newUrlHash === event.hash) {
        open()
      } else if (oldUrlHash === event.hash) {
        close()
      }
    })
    setHashChangeEventRegistered(true)
  }

  bindKey('Escape', close)

  return (
    <>
      <div className="h-full w-full" onClick={open}>
        {children}
      </div>
      <Modal show={isOpen()} onClose={close} size="3xl">
        <div className="rounded-lg text-white" style={{background: "rgb(2,34,50)", background: "linear-gradient(0deg, rgba(2,34,50,1) 0%, rgba(7,58,83,1) 100%)"}}>
          <Modal.Header className="modal-header border-white/20">
            <span className="text-white">{event.name}</span>
          </Modal.Header>
          <Modal.Body className="space-y-6 overflow-y-scroll max-h-[70vh]">
            <ul className="list-disc ml-4">
              <li><b>Date</b>: {dateStr(event.date, event.days)}</li>
              <li><b>Times</b>: {event.times}</li>
              <li><b>Organization</b>: {event.org}</li>
              <li><b>Attendees</b>: {event.attendees} ({event.difficulty})</li>
            </ul>
            <div className="event-tags">
              {event.tags.map((tag, i) => (
                (tag && <Tag key={i}>{tag}</Tag>)
              ))}
            </div>
            <p className="text-base text-white leading-relaxed prose">
              <Markdown>{event.description}</Markdown>
            </p>
            {event.timeslots && <TimeslotTable timeslots={event.timeslots} />}
          </Modal.Body>
          <Modal.Footer>
            {event.website &&
              <Link href={event.website} prefetch={false} target="_blank">
                <a target="_blank" rel="noreferrer">
                  <Button>
                    Website
                  </Button>
                </a>
              </Link>
            }
            <Button
              color="alternative"
              onClick={close}
            >
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  )
}

function TimeslotTable({ timeslots }) {
  return (
    <div>
      <h4 className="py-3 text-sm text-white">Schedule</h4>
      <table className="w-full text-sm text-left text-white">
        <thead className="text-xs text-gray-700 uppercase text-white">
          <tr className="border-b border-white/20">
            <th scope="col" className="px-6 py-3">time</th>
            <th scope="col" className="px-6 py-3">speaker</th>
            <th scope="col" className="px-6 py-3">info</th>
          </tr>
        </thead>
        <tbody>
          {timeslots.map((timeslot, i) => (
            <tr key={i} className="">
              <th scope="row" className="px-6 py-4 font-medium text-white align-top whitespace-nowrap">{timeslot.startTime}</th>
              <td className="px-6 py-4 align-top">{timeslot.speakers && timeslot.speakers.join(", ")}</td>
              <td className="px-6 py-4">
                <span className="font-bold">{timeslot.title}</span>
                <br/>
                <p>{timeslot.description}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AddEventModal({ config }) {
  const [openModal, setOpenModal] = useState(false);
  const open = () => setOpenModal(true)
  const close = () => setOpenModal(false)
  const isOpen = () => openModal === true

  // add opener to window.
  if (typeof window !== 'undefined') {
    window.showAddEventModal = open
  }

  bindKey('Escape', close)

  return (
    <>
      <Modal show={isOpen()} onClose={close}>
        <div className="rounded-lg text-white" style={{background: "rgb(2,34,50)", background: "linear-gradient(0deg, rgba(2,34,50,1) 0%, rgba(7,58,83,1) 100%)"}}>
          <div className="dark:bg-gray-400">
            <Modal.Header>
              <span className="text-white">Add your event</span>
            </Modal.Header>
            <Modal.Body className="space-y-6">
              The event listings in this website are coordinated through GitHub.

              Steps to list your event:
              <ol className="list-decimal ml-4 mt-3">
                <li><b>Step 1</b>: Read & file a pull-request in this repo: <br />
                  <a className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                     href={config.devent.repo} target="_blank">{config.devent.repo}</a></li>
                <li><b>Step 2</b>: Address any comments until your PR is merged.</li>
                <li><b>Step 3</b>: Blastoff! ⭐️💙</li>
              </ol>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={close}>
                Close
              </Button>
            </Modal.Footer>
          </div>
        </div>
      </Modal>
    </>
  )
}

export function Tag({ children }) {
  return (
    <button className="px-1.5 py-0.5 mr-1 my-1 border border-gray-400 text-gray-400 rounded-full text-xs cursor-default">
      {children}
    </button>
  )
}

function bindKey(bindKey, handler) {
  const kHandler = ({key}) => {
    if (key === bindKey) handler()
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', kHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', kHandler);
      }
    }
  }, []);
}

function dateStr(date, days) {
  const d1 = dayjs(date)

  if (days === 1) {
    return d1.format("MMM DD")
  }

  const d2 = d1.add(days - 1, 'day')
  return d1.format("MMM DD") +' - '+ d2.format("MMM DD")
}

export default EventCard
