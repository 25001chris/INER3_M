<%@ WebHandler Language="C#" Class="KMZProxy" %>
using System;
using System.IO;
using System.Data;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Web;
using System.Web.SessionState;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Reflection;
using System.Xml;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using ICSharpCode.SharpZipLib.Zip;

public class KMZProxy : IHttpHandler, IRequiresSessionState
{
	protected HttpContext m_Context = null;
	protected HttpApplicationState Application { get { return m_Context.Application; } }
	protected HttpServerUtility Server { get { return m_Context.Server; } }
	protected HttpRequest Request { get { return m_Context.Request; } }
	protected HttpResponse Response { get { return m_Context.Response; } }
	protected HttpSessionState Session { get { return m_Context.Session; } }

	void SaveStream(Stream s, string fileName)
	{
		string directoryName = Path.GetDirectoryName(fileName);
		if (!string.IsNullOrEmpty(directoryName) && !Directory.Exists(directoryName))
			Directory.CreateDirectory(directoryName);
		if (string.IsNullOrEmpty(Path.GetFileName(fileName)))
			return;
		using (FileStream streamWriter = File.Create(fileName))
		{
			int size = 2048;
			byte[] data = new byte[2048];
			while (true)
			{
				size = s.Read(data, 0, data.Length);
				if (size <= 0)
					break;
				streamWriter.Write(data, 0, size);
			}
		}
	}

	protected void UnZip(Stream ZipStream, string strUnzipPath)
	{
		if (ZipStream == null)
			return;
		try
		{
			using (ZipInputStream s = new ZipInputStream(ZipStream))
			{
				ZipEntry theEntry = s.GetNextEntry();
				while (theEntry != null)
				{
					SaveStream(s, Path.Combine(strUnzipPath, theEntry.Name));
					theEntry = s.GetNextEntry();
				}
				s.Close();
			}
		}
		catch (ZipException /*zex*/)
		{
		}
		return;
	}

	protected void CopyStream(Stream input, Stream output)
	{
		byte[] buf = new byte[65536];
		while (true)
		{
			int len = input.Read(buf, 0, 65535);
			if (len == 0)
				break;
			output.Write(buf, 0, len);
		}
	}

	private List<String> ProcessDirectory(string strPath)
	{
		if (Directory.Exists(strPath))
		{
			List<String> Zipeds = new List<String>();
			int nBasePos = strPath.Length;
			string[] sfiles = Directory.GetFiles(strPath, @"*.kml", SearchOption.AllDirectories);
			foreach (string sfile in sfiles)
			{
				Zipeds.Add(sfile.Substring(nBasePos + 1));
			}
			return Zipeds;
		}
		return null;
	}

	private void AddProxySession(string strPath)
	{
		List<string> KMZs = Session["KMZ"] as List<string>;
		if (KMZs == null)
		{
			KMZs = new List<string>();
			Session.Add("KMZ", KMZs);
		}
		if (KMZs.IndexOf(strPath) == -1)
			KMZs.Add(strPath);
	}
	
	public void ProcessRequest(HttpContext context)
	{
		m_Context = context;
		Response.Charset = "utf-8";

		string sMethod = null;
		string sPathInfo = Request.PathInfo;
		if (!string.IsNullOrEmpty(sPathInfo))
		{
			string[] MethodNames = sPathInfo.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
			if (MethodNames.Length > 0)
			{
				sMethod = MethodNames[0];
			}
		}
		else
		{
			sMethod = Request["Method"];
		}
		if (!string.IsNullOrEmpty(sMethod))
		{
			Type t = this.GetType();
			MethodInfo m = t.GetMethod(sMethod);
			if (m != null)
				m.Invoke(this, null);
		}
	}

	public bool IsReusable
	{
		get
		{
			return false;
		}
	}

	public virtual void Default()
	{
		Bitmap bmPhoto = new Bitmap(256, 256, PixelFormat.Format32bppArgb);
		Graphics grPhoto = Graphics.FromImage(bmPhoto);
		grPhoto.Clear(Color.FromArgb(128, 0, 255, 0));

		String drawString = Request.RawUrl;
		Font drawFont = new Font("Arial", 12);
		SolidBrush drawBrush = new SolidBrush(Color.Black);
		RectangleF drawRect = new RectangleF(0, 0, 256, 256);
		grPhoto.DrawString(drawString, drawFont, drawBrush, drawRect);

		bmPhoto.Save(Response.OutputStream, ImageFormat.Png);
	}

	public void Proxy()
	{
		string sPath = Request["Path"];
		if (string.IsNullOrEmpty(sPath))
			return;
		string strDocPath = "kmz/" + Path.GetFileName(sPath);
		if (sPath.StartsWith("http://"))
			strDocPath = "kmz/" + sPath.Substring(7);
		else if (sPath.StartsWith("https://"))
			strDocPath = "kmz/" + sPath.Substring(8);
		string strMapDocPath = Server.MapPath(strDocPath);
		string strUnzipPath = strDocPath + "_";
		string strMapUnzipPath = Server.MapPath(strUnzipPath);
		if (!File.Exists(strMapDocPath))
		{
			HttpWebRequest ProxyRequest = (HttpWebRequest)WebRequest.Create(sPath);
			ProxyRequest.Method = Request.HttpMethod;
			if (String.Compare(Request.HttpMethod, "POST", true) == 0)
			{
				ProxyRequest.ContentType = Request.ContentType;
				ProxyRequest.ContentLength = Request.ContentLength;
				Stream newStream = ProxyRequest.GetRequestStream();
				CopyStream(Request.InputStream, newStream);
				newStream.Close();
			}
			HttpWebResponse ProxyResponse = (HttpWebResponse)ProxyRequest.GetResponse();
			SaveStream(ProxyResponse.GetResponseStream(), strMapDocPath);
			ProxyResponse.Close();

		}
		if (!Directory.Exists(strMapUnzipPath))
		{
			FileStream fStm = new FileStream(strMapDocPath, FileMode.Open);
			UnZip(fStm, strMapUnzipPath);
			AddProxySession(strMapUnzipPath);
		}
		List<String> Zipeds = ProcessDirectory(strMapUnzipPath);
		if (Zipeds == null)
		{
			Response.TransmitFile(strMapDocPath);
		}
		else
		{
			//string strDocName = ProcessKML(strDocPath + "_");
			XmlDocument result = new XmlDocument();
			result.AppendChild(result.CreateProcessingInstruction("xml", "version='1.0' encoding='UTF-8'"));
			XmlElement pRoot = result.CreateElement("KMZProxy");
			result.AppendChild(pRoot);
			if (!string.IsNullOrEmpty(Request.PathInfo))
			{
				string[] MethodNames = Request.PathInfo.Split(new char[] { '/' });
				for (int j = 1; j < MethodNames.Length; j++)
					strUnzipPath = "../" + strUnzipPath;
			}
			pRoot.SetAttribute("Path", strUnzipPath);
			foreach (String s in Zipeds)
			{
				XmlElement pNode = result.CreateElement("Entry");
				pRoot.AppendChild(pNode);
				pNode.InnerText = s;
			}
			Response.ContentType = "text/xml";
			result.Save(Response.OutputStream);
		}
	}

	public void Upload()
	{
		XmlDocument result = new XmlDocument();
		result.AppendChild(result.CreateProcessingInstruction("xml", "version='1.0' encoding='UTF-8'"));
		XmlElement pRoot = result.CreateElement("KMZProxy");
		result.AppendChild(pRoot);
		
		HttpFileCollection uploadFiles = Request.Files;
		for (int i = 0; i < uploadFiles.Count; i++)
		{
			HttpPostedFile file = uploadFiles[i];
			string fileName = Path.GetFileName(file.FileName);
			if (fileName == string.Empty)
				continue;
			string strDocPath = "kmz/_localhost/" + fileName;
			string strMapDocPath = Server.MapPath(strDocPath);
			string strUnzipPath = strDocPath + "_";
			string strMapUnzipPath = Server.MapPath(strUnzipPath);
			if (!File.Exists(strMapDocPath))
			{
				SaveStream(file.InputStream, strMapDocPath);
			}
			if (!Directory.Exists(strMapUnzipPath))
			{
				FileStream fStm = new FileStream(strMapDocPath, FileMode.Open);
				UnZip(fStm, strMapUnzipPath);
				AddProxySession(strMapUnzipPath);
			}

			XmlElement pFile = result.CreateElement("File");
			pRoot.AppendChild(pFile);
			List<String> Zipeds = ProcessDirectory(strMapUnzipPath);
			if (Zipeds == null)
			{
				XmlElement pNode = result.CreateElement("Entry");
				pFile.AppendChild(pNode);
				pNode.InnerText = strDocPath;
			}
			else
			{
				if (!string.IsNullOrEmpty(Request.PathInfo))
				{
					string[] MethodNames = Request.PathInfo.Split(new char[] { '/' });
					for (int j = 1; j < MethodNames.Length; j++)
						strUnzipPath = "../" + strUnzipPath;
				}
				pFile.SetAttribute("Path", strUnzipPath);
				foreach (String s in Zipeds)
				{
					XmlElement pNode = result.CreateElement("Entry");
					pFile.AppendChild(pNode);
					pNode.InnerText = s;
				}
			}
		}

		Response.ContentType = "text/xml";
		result.Save(Response.OutputStream);
	}
	
	private void AddAddressList(MailAddressCollection Addresses, string strTmp)
	{
		if (string.IsNullOrEmpty(strTmp))
			return;
		string[] strTmps = strTmp.Split(new char[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
		foreach (string sTmp in strTmps)
			Addresses.Add(new MailAddress(sTmp));
	}

	public void ElectronicMail()
	{
		string sTo = Request["To"];
		string sCC = Request["CC"];
		string sBCC = Request["BCC"];
		string sSubject = Request["Subject"];
		string sBody = Request["Body"];
		string sAttach = Request["Attachment"];
		string sFrom = Request["From"];
		if (string.IsNullOrEmpty(sTo))
			return;

		MailMessage _Message = new MailMessage();
		_Message.IsBodyHtml = true;
		AddAddressList(_Message.To, sTo);
		AddAddressList(_Message.CC, sCC);
		AddAddressList(_Message.Bcc, sBCC);
		_Message.Subject = sSubject;
		_Message.Body = sBody;
		if (sFrom != null)
			_Message.From = new MailAddress(sFrom);

		if (sAttach != null)
		{
			sAttach.StartsWith("data:image/");
			int idx2 = sAttach.IndexOf(';');
			int idx = sAttach.IndexOf(',');
			string sFmt = sAttach.Substring(5, idx2 - 5);
			MemoryStream ms = new MemoryStream(Convert.FromBase64String(sAttach.Substring(idx + 1)));
			ContentType contentType = new ContentType(sFmt);
			contentType.Name = "image";
			Attachment imageAttachment = new Attachment(ms, contentType);
			_Message.Attachments.Add(imageAttachment);
		}
		
		SmtpClient smtpClient = new SmtpClient();
		smtpClient.Send(_Message);
	}
}