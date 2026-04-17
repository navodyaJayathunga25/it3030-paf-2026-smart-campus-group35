import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TicketStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { ticketService } from "@/services/ticketService";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, MapPin, Clock, User, Mail, Phone, Send,
  CheckCircle2, Pencil, Trash2, MessageSquare, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const statusSteps = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.getById(id!),
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["ticket-comments", id],
    queryFn: () => ticketService.getComments(id!),
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => ticketService.addComment(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", id] });
      setNewComment("");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to add comment"),
  });

  const editCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      ticketService.updateComment(id!, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-comments", id] });
      setEditingCommentId(null);
      setEditContent("");
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to update comment"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => ticketService.deleteComment(id!, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ticket-comments", id] }),
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to delete comment"),
  });

  if (isLoading) {
    return (
      <AppLayout title="Ticket Details">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout title="Ticket Not Found">
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">Ticket not found.</p>
          <Link to="/tickets"><Button variant="outline">Back to Tickets</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const currentStepIdx = statusSteps.indexOf(ticket.status);
  const shortId = ticket.id.slice(-8).toUpperCase();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  const startEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  return (
    <AppLayout title={`Ticket #${shortId}`} subtitle={ticket.category}>
      <Button variant="ghost" className="mb-4 text-slate-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Ticket Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.status === "REJECTED" ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-red-700">This ticket has been REJECTED</p>
                  {ticket.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {ticket.rejectionReason}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  {statusSteps.map((step, i) => {
                    const isCompleted = i < currentStepIdx;
                    const isCurrent = i === currentStepIdx;
                    return (
                      <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isCompleted ? "bg-emerald-100" :
                            isCurrent ? "bg-blue-100" : "bg-slate-100"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : isCurrent ? (
                              <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
                            ) : (
                              <div className="h-3 w-3 rounded-full bg-slate-300" />
                            )}
                          </div>
                          <span className={`text-[10px] mt-2 font-medium ${
                            isCompleted ? "text-emerald-600" :
                            isCurrent ? "text-blue-600" : "text-slate-400"
                          }`}>
                            {step.replace("_", " ")}
                          </span>
                        </div>
                        {i < statusSteps.length - 1 && (
                          <div className={`h-0.5 w-12 mx-1 ${
                            i < currentStepIdx ? "bg-emerald-300" : "bg-slate-200"
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Ticket Details</CardTitle>
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Category</p>
                  <p className="text-sm font-medium text-slate-900">{ticket.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Priority</p>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                {ticket.resourceName && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium">Resource</p>
                    <p className="text-sm font-medium text-slate-900">{ticket.resourceName}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Location</p>
                  <p className="text-sm font-medium text-slate-900">{ticket.location}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
              </div>
              {ticket.resolutionNotes && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Resolution Notes</p>
                  <p className="text-sm text-emerald-800">{ticket.resolutionNotes}</p>
                </div>
              )}
              {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium">Attachments</p>
                  <div className="flex gap-2 flex-wrap">
                    {ticket.attachmentUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-20 w-20 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-blue-600 hover:bg-slate-200 transition-colors"
                      >
                        Image {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment) => {
                const isOwn = comment.userId === user?.id;
                const isEditing = editingCommentId === comment.id;
                return (
                  <div key={comment.id} className={`p-4 rounded-lg ${
                    comment.userRole === "ADMIN" ? "bg-purple-50 border border-purple-100" :
                    comment.userRole === "TECHNICIAN" ? "bg-blue-50 border border-blue-100" :
                    comment.userRole === "LECTURER" ? "bg-amber-50 border border-amber-100" :
                    "bg-slate-50 border border-slate-100"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          comment.userRole === "ADMIN" ? "bg-purple-500" :
                          comment.userRole === "TECHNICIAN" ? "bg-blue-500" :
                          comment.userRole === "LECTURER" ? "bg-amber-500" : "bg-slate-500"
                        }`}>
                          {comment.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900">{comment.userName}</span>
                          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-white text-slate-500 font-medium">
                            {comment.userRole}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                        {isOwn && !isEditing && (
                          <div className="flex gap-1">
                            <button
                              className="p-1 rounded hover:bg-white transition-colors"
                              onClick={() => startEdit(comment.id, comment.content)}
                            >
                              <Pencil className="h-3 w-3 text-slate-400" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-white transition-colors"
                              onClick={() => deleteCommentMutation.mutate(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="text-xs"
                            onClick={() => editCommentMutation.mutate({ commentId: comment.id, content: editContent })}
                            disabled={editCommentMutation.isPending}
                          >
                            {editCommentMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => { setEditingCommentId(null); setEditContent(""); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    )}
                  </div>
                );
              })}

              {comments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No comments yet</p>
              )}

              {/* Add Comment */}
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="h-4 w-4 text-slate-400" />
                  {ticket.userName}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {ticket.contactEmail}
                </div>
                {ticket.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {ticket.contactPhone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {ticket.assignedToName && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-base font-semibold text-slate-900">Assigned Technician</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {ticket.assignedToName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{ticket.assignedToName}</p>
                    <p className="text-xs text-slate-500">Technician</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-base font-semibold text-slate-900">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="text-slate-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                {ticket.firstResponseAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">First Response</span>
                    <span className="text-slate-900">{new Date(ticket.firstResponseAt).toLocaleDateString()}</span>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resolved</span>
                    <span className="text-slate-900">{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Updated</span>
                  <span className="text-slate-900">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
